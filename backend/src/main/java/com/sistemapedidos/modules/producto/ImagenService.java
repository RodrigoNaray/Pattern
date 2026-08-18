package com.sistemapedidos.modules.producto;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sistemapedidos.common.config.AppProperties;
import com.sistemapedidos.common.error.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ImagenService {

    private static final List<String> EXTENSIONES_PERMITIDAS = List.of(".jpg", ".jpeg", ".png", ".webp");
    private static final long TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;
    private static final Pattern PUBLIC_ID_REGEX = Pattern.compile("/upload/v\\d+/(.+)\\.\\w+$");

    private final Path directorioUpload;
    private final String urlBase;
    private final boolean usarCloudinary;
    private final Cloudinary cloudinary;

    public ImagenService(AppProperties properties) {
        this.directorioUpload = Path.of("uploads", "productos").toAbsolutePath().normalize();
        this.urlBase = properties.getApiUrl();
        this.usarCloudinary = properties.usarCloudinary();

        if (usarCloudinary) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", properties.getCloudinary().getCloudName(),
                    "api_key", properties.getCloudinary().getApiKey(),
                    "api_secret", properties.getCloudinary().getApiSecret()));
        } else {
            this.cloudinary = null;
        }

        try {
            Files.createDirectories(directorioUpload);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo crear el directorio de uploads", e);
        }
    }

    public List<String> guardar(List<MultipartFile> archivos) {
        if (archivos == null || archivos.isEmpty()) {
            throw new BadRequestException("Seleccione al menos una imagen valida");
        }
        return archivos.stream().map(this::guardarArchivo).toList();
    }

    public void eliminar(List<String> urls) {
        for (String url : urls) {
            if (url != null && url.contains("res.cloudinary.com")) {
                eliminarCloudinary(url);
            } else {
                eliminarLocal(url);
            }
        }
    }

    private String guardarArchivo(MultipartFile archivo) {
        validarArchivo(archivo);
        if (usarCloudinary) {
            return guardarEnCloudinary(archivo);
        }
        return guardarEnLocal(archivo);
    }

    private String guardarEnCloudinary(MultipartFile archivo) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    archivo.getBytes(),
                    ObjectUtils.asMap("folder", "productos"));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new BadRequestException("Error al subir la imagen a Cloudinary");
        }
    }

    private String guardarEnLocal(MultipartFile archivo) {
        try {
            String extension = extension(archivo.getOriginalFilename());
            String nombreArchivo = UUID.randomUUID() + extension;
            archivo.transferTo(directorioUpload.resolve(nombreArchivo));
            return urlBase + "/uploads/productos/" + nombreArchivo;
        } catch (IOException e) {
            throw new BadRequestException("Error al guardar la imagen");
        }
    }

    private void eliminarCloudinary(String url) {
        try {
            String publicId = extraerPublicId(url);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception ex) {
            // Si no se puede eliminar de Cloudinary, se ignora.
        }
    }

    private void eliminarLocal(String url) {
        try {
            int index = url.indexOf("/uploads/productos/");
            if (index < 0) return;
            String nombreArchivo = url.substring(index + "/uploads/productos/".length());
            Files.deleteIfExists(directorioUpload.resolve(nombreArchivo));
        } catch (Exception ex) {
            // Si el archivo no existe o no se puede eliminar, se ignora.
        }
    }

    private String extraerPublicId(String url) {
        Matcher matcher = PUBLIC_ID_REGEX.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    private void validarArchivo(MultipartFile archivo) {
        String ext = extension(archivo.getOriginalFilename());
        if (!EXTENSIONES_PERMITIDAS.contains(ext)) {
            throw new BadRequestException("Formato de imagen no soportado. Use JPG, PNG o WebP");
        }
        if (archivo.getSize() > TAMANO_MAXIMO_BYTES) {
            throw new BadRequestException("La imagen supera el tamanio maximo permitido de 5 MB");
        }
    }

    private String extension(String nombre) {
        if (nombre == null) return "";
        int index = nombre.lastIndexOf('.');
        return index >= 0 ? nombre.substring(index).toLowerCase() : "";
    }
}
