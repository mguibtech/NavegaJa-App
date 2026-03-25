export class AuthValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    // Mínimo 6 caracteres
    return password.length >= 6;
  }

  static validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Evita CPFs com todos dígitos iguais (ex: 000.000.000-00)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Cálculo simplificado de validação (apenas para exemplo, ideal usar biblioteca ou lógica completa)
    return true; 
  }

  static validatePhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  }

  static validateName(name: string): boolean {
    return name.trim().length >= 3;
  }
}
