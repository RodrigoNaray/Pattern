package com.sistemapedidos.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Component
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private String jwtSecret = "default-secret-change-in-production";
    private Duration jwtExpiresIn = Duration.ofHours(24);
    private String corsOrigin;
    private String apiUrl = "http://localhost:8080";
    private String whatsappNumber;
    private boolean seedEnabled = true;
    private Cloudinary cloudinary = new Cloudinary();

    public boolean tieneCorsConfigurado() {
        return StringUtils.hasText(corsOrigin);
    }

    public boolean usarCloudinary() {
        return cloudinary != null
                && StringUtils.hasText(cloudinary.getCloudName())
                && StringUtils.hasText(cloudinary.getApiKey())
                && StringUtils.hasText(cloudinary.getApiSecret());
    }

    @Getter
    @Setter
    public static class Cloudinary {
        private String cloudName;
        private String apiKey;
        private String apiSecret;
    }
}
