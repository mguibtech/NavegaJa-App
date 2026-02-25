import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useBookingsScreen} from '../../screens/app/passenger/BookingsScreen/useBookingsScreen';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockFetchBookings = jest.fn(() => Promise.resolve());
const mockCancel = jest.fn(() => Promise.resolve());
const mockNavigate = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

let mockBookings: any[] = [];

jest.mock('@domain', () => ({
  useMyBookings: () => ({
    bookings: mockBookings,
    fetch: mockFetchBookings,
    error: null,
  }),
  useCancelBooking: () => ({
    cancel: mockCancel,
    isLoading: false,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn(),
  }),
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('@hooks', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
  useVirtualPagination: (data: any[]) => ({
    visibleItems: data,
    hasMore: false,
    loadMore: jest.fn(),
  }),
}));

// ─── Bookings de fixture ──────────────────────────────────────────────────────

const makeBooking = (id: string, status: string) => ({
  id,
  status,
  quantity: 1,
  totalPrice: '100',
  tripId: `trip-${id}`,
  trip: {origin: 'Manaus', destination: 'Parintins', departureAt: '2024-06-01T08:00:00Z'},
});

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockBookings = [];
});

describe('useBookingsScreen — filteredBookings', () => {
  it('aba "ativa" retorna pending, confirmed e checked_in', () => {
    mockBookings = [
      makeBooking('1', 'pending'),
      makeBooking('2', 'confirmed'),
      makeBooking('3', 'checked_in'),
      makeBooking('4', 'completed'),
      makeBooking('5', 'cancelled'),
    ];

    const {result} = renderHook(() => useBookingsScreen());

    // selectedTab inicia em 'active'
    expect(result.current.filteredBookings).toHaveLength(3);
    expect(result.current.filteredBookings.map(b => b.id)).toEqual(['1', '2', '3']);
  });

  it('aba "concluída" retorna completed e cancelled', async () => {
    mockBookings = [
      makeBooking('1', 'pending'),
      makeBooking('2', 'completed'),
      makeBooking('3', 'cancelled'),
    ];

    const {result} = renderHook(() => useBookingsScreen());

    act(() => result.current.setSelectedTab('completed'));

    expect(result.current.filteredBookings).toHaveLength(2);
    expect(result.current.filteredBookings.map(b => b.id)).toEqual(['2', '3']);
  });

  it('retorna lista vazia quando não há reservas', () => {
    mockBookings = [];
    const {result} = renderHook(() => useBookingsScreen());

    expect(result.current.filteredBookings).toHaveLength(0);
  });
});

describe('useBookingsScreen — getStatusBadge', () => {
  it('badge para pending', () => {
    const {result} = renderHook(() => useBookingsScreen());
    const badge = result.current.getStatusBadge('pending');

    expect(badge.label).toBe('Ag. Pagamento');
    expect(badge.bg).toBe('#FEF3C7');
    expect(badge.textColor).toBe('#92400E');
  });

  it('badge para confirmed', () => {
    const {result} = renderHook(() => useBookingsScreen());
    expect(result.current.getStatusBadge('confirmed').label).toBe('Confirmada');
  });

  it('badge para checked_in', () => {
    const {result} = renderHook(() => useBookingsScreen());
    expect(result.current.getStatusBadge('checked_in').label).toBe('Embarcado');
  });

  it('badge para completed', () => {
    const {result} = renderHook(() => useBookingsScreen());
    expect(result.current.getStatusBadge('completed').label).toBe('Concluída');
  });

  it('badge para cancelled', () => {
    const {result} = renderHook(() => useBookingsScreen());
    expect(result.current.getStatusBadge('cancelled').label).toBe('Cancelada');
  });

  it('badge para status desconhecido usa o status como label', () => {
    const {result} = renderHook(() => useBookingsScreen());
    const badge = result.current.getStatusBadge('unknown_status');
    expect(badge.label).toBe('unknown_status');
  });
});

describe('useBookingsScreen — cancelamento', () => {
  it('chama cancel com o id correto e exibe toast de sucesso', async () => {
    mockBookings = [makeBooking('booking-1', 'confirmed')];
    const {result} = renderHook(() => useBookingsScreen());

    act(() => result.current.setBookingToCancel(makeBooking('booking-1', 'confirmed') as any));

    await act(async () => {
      await result.current.handleConfirmCancel();
    });

    expect(mockCancel).toHaveBeenCalledWith('booking-1');
    expect(mockShowSuccess).toHaveBeenCalledWith('Reserva cancelada com sucesso.');
    expect(result.current.bookingToCancel).toBeNull();
  });

  it('exibe toast de erro quando cancelamento falha', async () => {
    mockCancel.mockRejectedValueOnce(new Error('Network error'));
    mockBookings = [makeBooking('booking-1', 'confirmed')];
    const {result} = renderHook(() => useBookingsScreen());

    act(() => result.current.setBookingToCancel(makeBooking('booking-1', 'confirmed') as any));

    await act(async () => {
      await result.current.handleConfirmCancel();
    });

    expect(mockShowError).toHaveBeenCalledWith('Não foi possível cancelar. Tente novamente.');
    expect(result.current.bookingToCancel).toBeNull();
  });

  it('não chama cancel se bookingToCancel é null', async () => {
    const {result} = renderHook(() => useBookingsScreen());

    await act(async () => {
      await result.current.handleConfirmCancel();
    });

    expect(mockCancel).not.toHaveBeenCalled();
  });
});

describe('useBookingsScreen — navegação', () => {
  it('navigateToTicket chama navigate com Ticket e bookingId', () => {
    const {result} = renderHook(() => useBookingsScreen());

    act(() => result.current.navigateToTicket('booking-abc'));

    expect(mockNavigate).toHaveBeenCalledWith('Ticket', {bookingId: 'booking-abc'});
  });

  it('navigateToReview chama navigate com TripReview e params corretos', () => {
    const {result} = renderHook(() => useBookingsScreen());

    act(() => result.current.navigateToReview('trip-123', 'Captain João', 'Barco Azul'));

    expect(mockNavigate).toHaveBeenCalledWith('TripReview', {
      tripId: 'trip-123',
      captainName: 'Captain João',
      boatName: 'Barco Azul',
    });
  });
});

describe('useBookingsScreen — refresh', () => {
  it('onRefresh chama fetchBookings e volta refreshing para false', async () => {
    const {result} = renderHook(() => useBookingsScreen());

    await act(async () => {
      await result.current.onRefresh();
    });

    await waitFor(() => expect(result.current.refreshing).toBe(false));
    expect(mockFetchBookings).toHaveBeenCalled();
  });
});
