import {useState} from 'react';
import {discountAPI} from '../discountAPI';
import {CalculatePriceRequest, CalculatePriceResponse} from '../discountTypes';

export function useCalculatePrice() {
  const [priceData, setPriceData] = useState<CalculatePriceResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function calculate(
    request: CalculatePriceRequest,
  ): Promise<CalculatePriceResponse> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await discountAPI.calculatePrice(request);
      setPriceData(result);
      return result;
    } catch (err: any) {
      // Se o endpoint não existir (404) ou houver erro no cupom (400), repassa o erro
      // para que a UI possa tratar (ex: "cupom inválido")
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setPriceData(null);
    setError(null);
  }

  return {
    priceData,
    calculate,
    reset,
    isLoading,
    error,
  };
}
