/**
 * Aplica máscara de telefone brasileiro
 * Formatos suportados:
 * - (92) 9100-1001 (8 dígitos)
 * - (92) 99100-1001 (9 dígitos - celular)
 */
export function formatPhone(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos (DDD + número)
  const limitedNumbers = numbers.slice(0, 11);

  // Aplica a máscara
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  }

  if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  }

  if (limitedNumbers.length <= 10) {
    // 8 dígitos: (92) 9100-1001
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  }

  // 9 dígitos: (92) 99100-1001
  return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
}

/**
 * Remove a máscara do telefone, deixando apenas números
 */
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida se o telefone tem formato válido
 * Aceita 10 ou 11 dígitos (com DDD)
 */
export function isValidPhone(value: string): boolean {
  const numbers = unformatPhone(value);
  return numbers.length === 10 || numbers.length === 11;
}
