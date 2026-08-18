package com.sistemapedidos.modules.pedido.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record CreatePedidoDto(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato valido") String emailComprador,
        @NotBlank(message = "El telefono es obligatorio")
        @Pattern(regexp = "^(0[1-9]\\d{6,7}|09\\d{7})$",
                message = "El telefono debe tener formato Uruguay (ej: 099123456 o 24001234)") String telefonoComprador,
        @NotNull(message = "El carrito esta vacio")
        @NotEmpty(message = "El carrito esta vacio")
        @Valid List<ItemDto> items,
        List<String> talles) {

    public record ItemDto(
            @NotBlank(message = "El ID del producto es obligatorio") String productoId,
            @NotNull(message = "La cantidad es obligatoria")
            @Min(value = 1, message = "La cantidad debe ser mayor a cero") Integer cantidad) {
    }
}
