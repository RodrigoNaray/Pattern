package com.sistemapedidos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SistemaPedidosApplication {

    public static void main(String[] args) {
        SpringApplication.run(SistemaPedidosApplication.class, args);
    }
}
