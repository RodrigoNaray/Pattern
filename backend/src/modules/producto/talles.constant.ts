export const TALLES_VALIDOS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'] as const;

export type TalleValido = (typeof TALLES_VALIDOS)[number];
