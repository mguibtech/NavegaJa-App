export const STRINGS = {
  common: {
    back: 'Voltar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    tryAgain: 'Tentar novamente',
    understand: 'Entendi',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    search: 'Buscar',
    noConnection: 'Sem conexão. Exibindo dados em cache.',
  },
  bookings: {
    title: 'Minhas Reservas',
    active: 'Ativas',
    completed: 'Concluídas',
    noActive: 'Nenhuma reserva ativa',
    noCompleted: 'Nenhuma reserva concluída',
    nextTrips: 'Suas próximas viagens aparecerão aqui',
    historyTrips: 'Seu histórico de viagens aparecerá aqui',
    cancelTitle: 'Cancelar reserva?',
    cancelMessage: 'Esta ação não pode ser desfeita. Deseja cancelar sua reserva?',
    cancelConfirm: 'Sim, cancelar',
    origin: 'Origem',
    destination: 'Destino',
    totalPaid: 'Total pago',
    viewQrCode: 'Ver QR Code',
    reviewTrip: 'Avaliar Viagem',
  },
  shipments: {
    title: 'Minhas Encomendas',
    active: 'Ativas',
    completed: 'Concluídas',
    noActive: 'Nenhuma encomenda ativa',
    noCompleted: 'Nenhuma encomenda concluída',
    createShipment: 'Enviar Encomenda',
    trackingCode: 'Código de Rastreamento',
    recipient: 'Destinatário',
    details: 'Detalhes',
    history: 'Histórico',
  },
};

/**
 * Helper simples para traduções (futuramente pode integrar com i18next)
 */
export const t = (path: string): string => {
  const keys = path.split('.');
  let current: any = STRINGS;
  
  for (const key of keys) {
    if (current[key] === undefined) return path;
    current = current[key];
  }
  
  return current;
};
