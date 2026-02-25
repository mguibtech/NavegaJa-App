import {formatPhone, unformatPhone, isValidPhone} from '../../utils/phoneMask';

describe('formatPhone', () => {
  it('formata celular com 9 dígitos (11 com DDD)', () => {
    expect(formatPhone('92991001001')).toBe('(92) 99100-1001');
  });

  it('formata fixo com 8 dígitos (10 com DDD)', () => {
    expect(formatPhone('9291001001')).toBe('(92) 9100-1001');
  });

  it('formata entrada parcial com 2 dígitos', () => {
    expect(formatPhone('92')).toBe('92');
  });

  it('formata entrada parcial com 4 dígitos', () => {
    expect(formatPhone('9299')).toBe('(92) 99');
  });

  it('formata entrada parcial com 8 dígitos', () => {
    expect(formatPhone('92991001')).toBe('(92) 9910-01');
  });

  it('ignora caracteres não numéricos', () => {
    expect(formatPhone('(92) 99100-1001')).toBe('(92) 99100-1001');
  });

  it('limita a 11 dígitos', () => {
    expect(formatPhone('929910010011234')).toBe('(92) 99100-1001');
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(formatPhone('')).toBe('');
  });
});

describe('unformatPhone', () => {
  it('remove máscara do telefone formatado', () => {
    expect(unformatPhone('(92) 99100-1001')).toBe('92991001001');
  });

  it('não altera número já limpo', () => {
    expect(unformatPhone('92991001001')).toBe('92991001001');
  });

  it('remove todos os caracteres especiais', () => {
    expect(unformatPhone('(92) 9100-1001')).toBe('9291001001');
  });
});

describe('isValidPhone', () => {
  it('aceita celular com 11 dígitos', () => {
    expect(isValidPhone('92991001001')).toBe(true);
  });

  it('aceita fixo com 10 dígitos', () => {
    expect(isValidPhone('9291001001')).toBe(true);
  });

  it('aceita número formatado', () => {
    expect(isValidPhone('(92) 99100-1001')).toBe(true);
  });

  it('rejeita número muito curto', () => {
    expect(isValidPhone('9299')).toBe(false);
  });

  it('rejeita número muito longo', () => {
    expect(isValidPhone('929910010011')).toBe(false);
  });

  it('rejeita string vazia', () => {
    expect(isValidPhone('')).toBe(false);
  });
});
