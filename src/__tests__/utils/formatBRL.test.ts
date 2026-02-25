import {formatBRL} from '../../utils/formatBRL';

describe('formatBRL', () => {
  it('formata número inteiro', () => {
    expect(formatBRL(1000)).toBe('R$ 1.000,00');
  });

  it('formata valor com casas decimais', () => {
    expect(formatBRL(1234.5)).toBe('R$ 1.234,50');
  });

  it('formata valor zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formata valores pequenos', () => {
    expect(formatBRL(9.99)).toBe('R$ 9,99');
  });

  it('formata valores grandes (milhões)', () => {
    expect(formatBRL(1000000)).toBe('R$ 1.000.000,00');
  });

  it('aceita string numérica', () => {
    expect(formatBRL('250.75')).toBe('R$ 250,75');
  });

  it('retorna R$ 0,00 para string inválida', () => {
    expect(formatBRL('abc')).toBe('R$ 0,00');
  });

  it('arredonda corretamente (floating-point JS: 1.005 vira 1.00)', () => {
    // Em JS, 1.005.toFixed(2) === '1.00' por representação binária
    expect(formatBRL(1.005)).toBe('R$ 1,00');
  });

  it('arredonda usando toFixed(2) — resultado consistente', () => {
    // 1.126 → 1.13 (arredondamento .toFixed padrão)
    expect(formatBRL(1.126)).toBe('R$ 1,13');
  });

  it('formata valor negativo', () => {
    expect(formatBRL(-50)).toBe('R$ -50,00');
  });

  it('formata 99 centavos', () => {
    expect(formatBRL(0.99)).toBe('R$ 0,99');
  });
});
