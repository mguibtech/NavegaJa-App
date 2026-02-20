import {useState, useEffect} from 'react';
import {promotionAPI} from '../promotionAPI';
import {Promotion} from '../promotionTypes';

// Cache simples em memória: evita 429 buscando dados com frequência
let _cachedPromotions: Promotion[] | null = null;
let _cacheTimestamp = 0;
let _pendingFetch: Promise<void> | null = null; // deduplicação de chamadas simultâneas
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>(_cachedPromotions ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch(): Promise<void> {
    // Usa cache se ainda válido
    const now = Date.now();
    if (_cachedPromotions !== null && now - _cacheTimestamp < CACHE_TTL_MS) {
      setPromotions(_cachedPromotions);
      return;
    }

    // Deduplica: se já tem uma requisição em andamento, aguarda ela
    if (_pendingFetch) {
      await _pendingFetch;
      if (_cachedPromotions !== null) {setPromotions(_cachedPromotions);}
      return;
    }

    setIsLoading(true);
    setError(null);
    _pendingFetch = doFetch();
    await _pendingFetch;
    _pendingFetch = null;
  }

  async function doFetch(): Promise<void> {

    try {
      const response = await promotionAPI.getActivePromotions();

      if (!response || !Array.isArray(response.promotions)) {
        setPromotions([]);
        _cachedPromotions = [];
        _cacheTimestamp = Date.now();
        return;
      }

      const nowDate = new Date();
      const activePromotions = response.promotions
        .filter(promo => {
          const isActive = promo.isActive !== undefined ? promo.isActive : true;
          const isDateValid =
            nowDate >= new Date(promo.startDate) && nowDate <= new Date(promo.endDate);
          return isActive && isDateValid;
        })
        .sort((a, b) => b.priority - a.priority);

      _cachedPromotions = activePromotions;
      _cacheTimestamp = Date.now();
      setPromotions(activePromotions);
    } catch (err: any) {
      const status = err?.statusCode ?? err?.response?.status;
      // 404: endpoint não implementado; 429: rate limit — ambos silenciosos
      if (status === 404 || status === 429) {
        setPromotions(_cachedPromotions ?? []);
      } else {
        setError(err as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  return {
    promotions,
    fetch,
    isLoading,
    error,
  };
}
