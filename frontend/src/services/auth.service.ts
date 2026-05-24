import type { AuthResponse } from '../types/auth-response';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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

  return response.json() as Promise<AuthResponse>;
}

export function obtenerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function guardarToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

export function eliminarToken(): void {
  localStorage.removeItem('accessToken');
}

export function estaAutenticado(): boolean {
  return obtenerToken() !== null;
}
