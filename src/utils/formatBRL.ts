/**
 * Formata um valor numérico para o padrão monetário BRL.
 * Exemplo: 1234.5 → "R$ 1.234,50"
 */
export function formatBRL(value: number | string): string {
  const num = Number(value) || 0;
  const formatted = num
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${formatted}`;
}
