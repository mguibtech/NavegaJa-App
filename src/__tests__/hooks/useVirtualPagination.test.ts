import {renderHook, act} from '@testing-library/react-native';
import {useVirtualPagination} from '../../hooks/useVirtualPagination';

const makeList = (size: number) => Array.from({length: size}, (_, i) => i + 1);

describe('useVirtualPagination', () => {
  it('inicia com os primeiros 20 itens por padrão', () => {
    const data = makeList(50);
    const {result} = renderHook(() => useVirtualPagination(data));

    expect(result.current.visibleItems).toHaveLength(20);
    expect(result.current.visibleItems[0]).toBe(1);
    expect(result.current.visibleItems[19]).toBe(20);
  });

  it('respeita pageSize customizado', () => {
    const data = makeList(50);
    const {result} = renderHook(() => useVirtualPagination(data, 10));

    expect(result.current.visibleItems).toHaveLength(10);
  });

  it('hasMore é true quando há mais itens', () => {
    const data = makeList(50);
    const {result} = renderHook(() => useVirtualPagination(data));

    expect(result.current.hasMore).toBe(true);
  });

  it('hasMore é false quando todos os itens são visíveis', () => {
    const data = makeList(5);
    const {result} = renderHook(() => useVirtualPagination(data));

    expect(result.current.hasMore).toBe(false);
  });

  it('hasMore é false com lista vazia', () => {
    const {result} = renderHook(() => useVirtualPagination([]));

    expect(result.current.hasMore).toBe(false);
    expect(result.current.visibleItems).toHaveLength(0);
  });

  it('loadMore carrega mais um bloco', () => {
    const data = makeList(50);
    const {result} = renderHook(() => useVirtualPagination(data, 10));

    act(() => result.current.loadMore());

    expect(result.current.visibleItems).toHaveLength(20);
    expect(result.current.visibleItems[19]).toBe(20);
  });

  it('loadMore não ultrapassa o tamanho total', () => {
    const data = makeList(25);
    const {result} = renderHook(() => useVirtualPagination(data, 20));

    act(() => result.current.loadMore());

    expect(result.current.visibleItems).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);
  });

  it('loadMore não faz nada quando hasMore é false', () => {
    const data = makeList(5);
    const {result} = renderHook(() => useVirtualPagination(data));

    act(() => result.current.loadMore());

    expect(result.current.visibleItems).toHaveLength(5);
  });

  it('reseta para a primeira página quando o tamanho dos dados muda', () => {
    let data = makeList(50);
    const {result, rerender} = renderHook<
      ReturnType<typeof useVirtualPagination>,
      {d: number[]}
    >(
      ({d}) => useVirtualPagination(d, 10),
      {initialProps: {d: data}},
    );

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toHaveLength(20);

    // Simula mudança de filtro (novos dados com tamanho diferente)
    data = makeList(30);
    rerender({d: data});

    expect(result.current.visibleItems).toHaveLength(10);
  });

  it('carrega múltiplas páginas progressivamente', () => {
    const data = makeList(55);
    const {result} = renderHook(() => useVirtualPagination(data, 20));

    expect(result.current.visibleItems).toHaveLength(20);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toHaveLength(40);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toHaveLength(55);
    expect(result.current.hasMore).toBe(false);
  });
});
