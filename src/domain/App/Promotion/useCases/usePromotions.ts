import {useState, useEffect} from 'react';
import {promotionAPI} from '../promotionAPI';
import {Promotion} from '../promotionTypes';

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Promotions] 🔍 Buscando promoções...');
      const response = await promotionAPI.getActivePromotions();
      console.log('[Promotions] ✅ Resposta recebida:', JSON.stringify(response, null, 2));

      // Verificar se a resposta é válida
      if (!response || !Array.isArray(response.promotions)) {
        console.log('[Promotions] ❌ Resposta inválida do backend');
        setPromotions([]);
        return;
      }

      console.log('[Promotions] 📦 Total de promoções:', response.promotions.length);

      // Filtrar apenas promoções ativas e dentro do período válido
      const now = new Date();
      const activePromotions = response.promotions.filter(promo => {
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        const isDateValid = now >= startDate && now <= endDate;

        // Se isActive não existir, considera como true (tolerante)
        const isActive = promo.isActive !== undefined ? promo.isActive : true;

        console.log(`[Promotions] Filtro - ${promo.title}: isActive=${isActive}, dateValid=${isDateValid}`);

        return isActive && isDateValid;
      });

      console.log('[Promotions] ✨ Promoções ativas após filtro:', activePromotions.length);

      // Ordenar por prioridade
      const sorted = activePromotions.sort((a, b) => b.priority - a.priority);

      setPromotions(sorted);
      console.log('[Promotions] 🎉 Promoções definidas no state!');
    } catch (err: any) {
      // Se o endpoint não existir (404), ignora silenciosamente
      // Isso permite que o app funcione mesmo sem o backend de promoções implementado
      if (err?.statusCode === 404 || err?.response?.status === 404) {
        setPromotions([]);
        console.log('[Promotions] Endpoint não implementado ainda, continuando sem promoções');
      } else {
        // Outros erros são reportados
        setError(err as Error);
        console.error('Error fetching promotions:', err);
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
