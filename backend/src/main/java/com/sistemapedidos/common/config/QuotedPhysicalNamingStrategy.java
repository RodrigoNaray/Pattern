package com.sistemapedidos.common.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

/**
 * El schema es generado por Prisma con identificadores en camelCase entre comillas
 * (ej: "actualizadoEn"). Esta estrategia cita todos los identificadores en el SQL
 * generado por Hibernate para que coincidan exactamente con las tablas/columnas.
 */
public class QuotedPhysicalNamingStrategy implements PhysicalNamingStrategy {

    @Override
    public Identifier toPhysicalCatalogName(Identifier name, JdbcEnvironment jdbcEnvironment) {
        return citar(name);
    }

    @Override
    public Identifier toPhysicalSchemaName(Identifier name, JdbcEnvironment jdbcEnvironment) {
        return citar(name);
    }

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment jdbcEnvironment) {
        return citar(name);
    }

    @Override
    public Identifier toPhysicalSequenceName(Identifier name, JdbcEnvironment jdbcEnvironment) {
        return citar(name);
    }

    @Override
    public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment jdbcEnvironment) {
        return citar(name);
    }

    private Identifier citar(Identifier nombre) {
        if (nombre == null) {
            return null;
        }
        return Identifier.toIdentifier(nombre.getText(), true);
    }
}
