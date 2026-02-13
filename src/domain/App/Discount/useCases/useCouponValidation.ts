import {useState} from 'react';

import {discountAPI} from '../discountAPI';
import {CouponState, ValidateCouponRequest} from '../discountTypes';

/**
 * Hook para validação de cupons com máquina de estados
 * Segue spec: docs/COUPON_VALIDATION_SPEC.md
 */
export function useCouponValidation() {
  const [state, setState] = useState<CouponState>({status: 'NOT_VALIDATED'});

  /**
   * Valida um cupom
   */
  const validate = async (request: ValidateCouponRequest) => {
    // Estado: VALIDATING
    setState({status: 'VALIDATING'});

    try {
      const response = await discountAPI.validateCoupon(request);

      if (response.valid && response.data) {
        // Estado: VALID
        setState({
          status: 'VALID',
          data: response.data,
        });
      } else {
        // Estado: INVALID
        setState({
          status: 'INVALID',
          error: response.message || 'Cupom inválido',
        });
      }
    } catch (error: any) {
      // Estado: ERROR (erro de rede/servidor)
      setState({
        status: 'ERROR',
        error: error.message || 'Erro ao validar cupom. Tente novamente.',
      });
    }
  };

  /**
   * Remove cupom aplicado
   */
  const remove = () => {
    setState({status: 'NOT_VALIDATED'});
  };

  /**
   * Tenta validar novamente (após erro de rede)
   */
  const retry = () => {
    setState({status: 'NOT_VALIDATED'});
  };

  /**
   * Reseta o estado
   */
  const reset = () => {
    setState({status: 'NOT_VALIDATED'});
  };

  return {
    state,
    validate,
    remove,
    retry,
    reset,
  };
}
