/**
 * @format
 */

// Funções de validação de CPF do BookingScreen
// Copiadas para testar isoladamente
function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  if (parseInt(cleanCPF.charAt(9)) !== digit1) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  if (parseInt(cleanCPF.charAt(10)) !== digit2) return false;

  return true;
}

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  let formatted = numbers;
  if (numbers.length > 3) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length > 6) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  if (numbers.length > 9) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  return formatted;
}

function isCPFComplete(cpf: string): boolean {
  return cpf.replace(/\D/g, '').length === 11;
}

describe('CPF Validation', () => {
  describe('isValidCPF', () => {
    it('should validate correct CPF', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true);
      expect(isValidCPF('11144477735')).toBe(true);
    });

    it('should invalidate CPF with all same digits', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false);
      expect(isValidCPF('000.000.000-00')).toBe(false);
      expect(isValidCPF('999.999.999-99')).toBe(false);
    });

    it('should invalidate CPF with wrong check digits', () => {
      expect(isValidCPF('111.444.777-36')).toBe(false); // Último dígito errado
      expect(isValidCPF('111.444.777-45')).toBe(false); // Penúltimo dígito errado
    });

    it('should invalidate CPF with less than 11 digits', () => {
      expect(isValidCPF('111.444.777')).toBe(false);
      expect(isValidCPF('11144477')).toBe(false);
      expect(isValidCPF('')).toBe(false);
    });

    it('should invalidate CPF with more than 11 digits', () => {
      expect(isValidCPF('111.444.777-355')).toBe(false);
    });

    it('should handle CPF with special characters', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true);
      expect(isValidCPF('111/444/777-35')).toBe(true); // Remove não-dígitos
    });
  });

  describe('formatCPF', () => {
    it('should format CPF with dots and dash', () => {
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
    });

    it('should format partial CPF progressively', () => {
      expect(formatCPF('111')).toBe('111');
      expect(formatCPF('1114')).toBe('111.4');
      expect(formatCPF('1114447')).toBe('111.444.7');
      expect(formatCPF('111444777')).toBe('111.444.777');
      expect(formatCPF('1114447773')).toBe('111.444.777-3');
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
    });

    it('should remove non-digit characters', () => {
      expect(formatCPF('111abc444def777ghi35')).toBe('111.444.777-35');
      expect(formatCPF('111.444.777-35')).toBe('111.444.777-35');
    });

    it('should limit to 11 digits', () => {
      expect(formatCPF('111444777359999')).toBe('111.444.777-35');
    });

    it('should handle empty string', () => {
      expect(formatCPF('')).toBe('');
    });
  });

  describe('isCPFComplete', () => {
    it('should return true for 11 digits', () => {
      expect(isCPFComplete('11144477735')).toBe(true);
      expect(isCPFComplete('111.444.777-35')).toBe(true);
    });

    it('should return false for less than 11 digits', () => {
      expect(isCPFComplete('1114447773')).toBe(false);
      expect(isCPFComplete('111.444.777')).toBe(false);
      expect(isCPFComplete('')).toBe(false);
    });

    it('should return false for more than 11 digits', () => {
      expect(isCPFComplete('111444777355')).toBe(false);
    });
  });

  describe('Integration: Format + Validate', () => {
    it('should format and validate correct CPF', () => {
      const input = '11144477735';
      const formatted = formatCPF(input);
      expect(formatted).toBe('111.444.777-35');
      expect(isValidCPF(formatted)).toBe(true);
    });

    it('should format invalid CPF but validation should fail', () => {
      const input = '11144477736'; // Dígito verificador errado
      const formatted = formatCPF(input);
      expect(formatted).toBe('111.444.777-36');
      expect(isValidCPF(formatted)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle CPF with spaces', () => {
      expect(isValidCPF('111 444 777 35')).toBe(true);
      expect(formatCPF('111 444 777 35')).toBe('111.444.777-35');
    });

    it('should handle CPF with leading zeros', () => {
      expect(isValidCPF('000.000.000-00')).toBe(false); // Todos iguais
      expect(isValidCPF('012.345.678-90')).toBe(true); // CPF válido com zero no início
    });
  });
});
