package com.sistemapedidos.modules.producto;

import java.util.List;

public final class TallesConstants {

    public static final List<String> TALLES_VALIDOS = List.of(
            "XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46");

    public static final String TALLES_REGEX = "^(XS|S|M|L|XL|XXL|36|38|40|42|44|46)$";

    private TallesConstants() {
    }
}
