import {CreateShipmentData} from './shipmentTypes';

export const SHIPMENT_VALIDATION_RULES = {
  RECIPIENT_NAME_MIN_LENGTH: 3,
  RECIPIENT_ADDRESS_MIN_LENGTH: 10,
  DESCRIPTION_MIN_LENGTH: 5,
  MIN_WEIGHT: 0.1,
  MAX_WEIGHT: 50,
  MAX_DIMENSION: 200,
};

export class ShipmentValidator {
  static validate(data: CreateShipmentData): {isValid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (!data.recipientName.trim() || data.recipientName.trim().length < SHIPMENT_VALIDATION_RULES.RECIPIENT_NAME_MIN_LENGTH) {
      errors.push('O nome do destinatário deve ter pelo menos 3 caracteres.');
    }

    if (!this.isValidPhone(data.recipientPhone)) {
      errors.push('Digite um telefone válido com DDD.');
    }

    if (!data.recipientAddress.trim() || data.recipientAddress.trim().length < SHIPMENT_VALIDATION_RULES.RECIPIENT_ADDRESS_MIN_LENGTH) {
      errors.push('O endereço deve ser completo (mínimo 10 caracteres).');
    }

    if (!data.description.trim() || data.description.trim().length < SHIPMENT_VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      errors.push('A descrição deve ter pelo menos 5 caracteres.');
    }

    if (data.weight < SHIPMENT_VALIDATION_RULES.MIN_WEIGHT || data.weight > SHIPMENT_VALIDATION_RULES.MAX_WEIGHT) {
      errors.push(`O peso deve estar entre ${SHIPMENT_VALIDATION_RULES.MIN_WEIGHT}kg e ${SHIPMENT_VALIDATION_RULES.MAX_WEIGHT}kg.`);
    }

    if (data.dimensions) {
      const {length, width, height} = data.dimensions;
      if (length > SHIPMENT_VALIDATION_RULES.MAX_DIMENSION || 
          width > SHIPMENT_VALIDATION_RULES.MAX_DIMENSION || 
          height > SHIPMENT_VALIDATION_RULES.MAX_DIMENSION) {
        errors.push(`As dimensões não podem exceder ${SHIPMENT_VALIDATION_RULES.MAX_DIMENSION}cm.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static isValidPhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  }
}
