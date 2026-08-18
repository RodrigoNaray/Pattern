package com.sistemapedidos.common.error;

public record ApiError(int statusCode, String message, String error) {
}
