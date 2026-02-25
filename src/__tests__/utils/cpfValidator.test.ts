import {
  isValidCPF,
  formatCPF,
  cleanCPF,
  isCPFComplete,
  TEST_VALID_CPFS,
  INVALID_CPFS,
} from '../../utils/cpfValidator';

describe('isValidCPF', () => {
  it('aceita CPF válido formatado', () => {
    expect(isValidCPF('123.456.789-09')).toBe(true);
  });

  it('aceita CPF válido sem formatação', () => {
    expect(isValidCPF('12345678909')).toBe(true);
  });

  it('aceita CPF válido da lista TEST_VALID_CPFS', () => {
    TEST_VALID_CPFS.forEach(cpf => {
      expect(isValidCPF(cpf)).toBe(true);
    });
  });

  it('rejeita CPFs com todos os dígitos iguais', () => {
    INVALID_CPFS.forEach(cpf => {
      expect(isValidCPF(cpf)).toBe(false);
    });
  });

  it('rejeita CPF com menos de 11 dígitos', () => {
    expect(isValidCPF('123.456.789')).toBe(false);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(isValidCPF('123.456.789-00')).toBe(false);
  });

  it('rejeita string vazia', () => {
    expect(isValidCPF('')).toBe(false);
  });
});

describe('formatCPF', () => {
  it('formata CPF de 11 dígitos sem pontuação', () => {
    expect(formatCPF('12345678909')).toBe('123.456.789-09');
  });

  it('formata parcialmente com 3 dígitos', () => {
    expect(formatCPF('123')).toBe('123');
  });

  it('formata parcialmente com 6 dígitos', () => {
    expect(formatCPF('123456')).toBe('123.456');
  });

  it('formata parcialmente com 9 dígitos', () => {
    expect(formatCPF('123456789')).toBe('123.456.789');
  });

  it('limita a 11 dígitos', () => {
    expect(formatCPF('123456789001234')).toBe('123.456.789-00');
  });

  it('ignora caracteres não numéricos na entrada', () => {
    expect(formatCPF('abc123def456ghi789-09')).toBe('123.456.789-09');
  });
});

describe('cleanCPF', () => {
  it('remove pontuação do CPF formatado', () => {
    expect(cleanCPF('123.456.789-09')).toBe('12345678909');
  });

  it('não altera CPF já limpo', () => {
    expect(cleanCPF('12345678909')).toBe('12345678909');
  });

  it('remove espaços e outros caracteres', () => {
    expect(cleanCPF('123 456 789 09')).toBe('12345678909');
  });
});

describe('isCPFComplete', () => {
  it('retorna true para 11 dígitos formatados', () => {
    expect(isCPFComplete('123.456.789-09')).toBe(true);
  });

  it('retorna true para 11 dígitos sem formatação', () => {
    expect(isCPFComplete('12345678909')).toBe(true);
  });

  it('retorna false para menos de 11 dígitos', () => {
    expect(isCPFComplete('123.456.789')).toBe(false);
  });

  it('retorna false para string vazia', () => {
    expect(isCPFComplete('')).toBe(false);
  });
});
