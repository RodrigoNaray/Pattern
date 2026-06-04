import type { AuthResponse } from '../types/auth-response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const mensaje = (data as { message?: string }).message ?? 'Credenciales incorrectas';
    throw new Error(mensaje);
  }

  const data = (await response.json()) as AuthResponse;
  guardarToken(data.accessToken);
  return data;
}

export function obtenerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function guardarToken(token: string): void {
  localStorage.setItem('accessToken', token);
  setCookie('admin-token', token, 7);
}

export function eliminarToken(): void {
  localStorage.removeItem('accessToken');
  deleteCookie('admin-token');
}

export function estaAutenticado(): boolean {
  return obtenerToken() !== null;
}

export async function cambiarPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ mensaje: string }> {
  const token = obtenerToken();
  const response = await fetch(`${API_BASE_URL}/auth/cambiar-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const mensaje = (data as { message?: string }).message ?? 'Error al cambiar la contraseña';
    throw new Error(mensaje);
  }

  return response.json();
}
