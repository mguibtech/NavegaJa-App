/**
 * Valida CPF brasileiro (com dígitos verificadores)
 *
 * @param cpf - CPF formatado (000.000.000-00) ou sem formatação (00000000000)
 * @returns true se CPF é válido, false caso contrário
 *
 * @example
 * isValidCPF('123.456.789-09') // true ou false
 * isValidCPF('12345678909') // true ou false
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }

  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) {
    digit1 = 0;
  }

  if (parseInt(cleanCPF.charAt(9)) !== digit1) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }

  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) {
    digit2 = 0;
  }

  if (parseInt(cleanCPF.charAt(10)) !== digit2) {
    return false;
  }

  // CPF válido!
  return true;
}

/**
 * Formata CPF para o padrão brasileiro (000.000.000-00)
 *
 * @param cpf - CPF sem formatação ou parcialmente formatado
 * @returns CPF formatado
 *
 * @example
 * formatCPF('12345678909') // '123.456.789-09'
 */
export function formatCPF(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);

  // Aplica a máscara XXX.XXX.XXX-XX
  let formatted = limitedNumbers;

  if (limitedNumbers.length > 3) {
    formatted = `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  }
  if (limitedNumbers.length > 6) {
    formatted = `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  }
  if (limitedNumbers.length > 9) {
    formatted = `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
  }

  return formatted;
}

/**
 * Remove formatação do CPF
 *
 * @param cpf - CPF formatado
 * @returns CPF sem formatação (apenas números)
 *
 * @example
 * cleanCPF('123.456.789-09') // '12345678909'
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Verifica se CPF está completo (11 dígitos)
 *
 * @param cpf - CPF formatado ou não
 * @returns true se tem 11 dígitos
 */
export function isCPFComplete(cpf: string): boolean {
  const clean = cleanCPF(cpf);
  return clean.length === 11;
}

/**
 * CPFs inválidos conhecidos (para testes)
 */
export const INVALID_CPFS = [
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
];

/**
 * CPFs válidos para teste
 */
export const TEST_VALID_CPFS = [
  '123.456.789-09',
  '111.444.777-35',
];
