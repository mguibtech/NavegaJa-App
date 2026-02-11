/**
 * Formata email removendo espaços e convertendo para lowercase
 */
export function formatEmail(value: string): string {
  // Remove espaços em branco
  const withoutSpaces = value.replace(/\s/g, '');

  // Converte para lowercase
  return withoutSpaces.toLowerCase();
}

/**
 * Valida se o email tem formato válido
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}
