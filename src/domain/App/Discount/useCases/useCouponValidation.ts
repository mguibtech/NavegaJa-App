import {useState} from 'react';
import {useMutation} from '@tanstack/react-query';

import {discountService} from '../discountService';
import {CouponState, ValidateCouponRequest} from '../discountTypes';

export function useCouponValidation() {
  const [state, setState] = useState<CouponState>({status: 'NOT_VALIDATED'});

  const mutation = useMutation<void, Error, ValidateCouponRequest>({
    mutationFn: async (request: ValidateCouponRequest) => {
      setState({status: 'VALIDATING'});
      const response = await discountService.validateCoupon(request);
      if (response.valid && response.data) {
        setState({status: 'VALID', data: response.data});
      } else {
        setState({status: 'INVALID', error: response.message || 'Cupom inválido'});
      }
    },
    onError: (error) => {
      setState({status: 'ERROR', error: error.message || 'Erro ao validar cupom. Tente novamente.'});
    },
  });

  return {
    state,
    validate: mutation.mutateAsync,
    remove: () => setState({status: 'NOT_VALIDATED'}),
    retry: () => setState({status: 'NOT_VALIDATED'}),
    reset: () => setState({status: 'NOT_VALIDATED'}),
  };
}
