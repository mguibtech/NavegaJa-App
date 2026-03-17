import {
  normalizeFileUrl,
  getFilePreviewUri,
  getFilePreviewCandidates,
  API_BASE_URL,
} from '../../api/config';

describe('normalizeFileUrl', () => {
  it('retorna string vazia para null', () => {
    expect(normalizeFileUrl(null)).toBe('');
  });

  it('retorna string vazia para undefined', () => {
    expect(normalizeFileUrl(undefined)).toBe('');
  });

  it('retorna string vazia para string vazia', () => {
    expect(normalizeFileUrl('')).toBe('');
  });

  it('substitui localhost pelo API_BASE_URL (sem localhost na saída)', () => {
    const url = 'http://localhost:3000/uploads/foto.jpg';
    const result = normalizeFileUrl(url);
    expect(result).not.toMatch(/localhost/);
    expect(result).toContain('/uploads/foto.jpg');
    expect(result).toContain(API_BASE_URL);
  });

  it('substitui 127.0.0.1 pelo API_BASE_URL', () => {
    const url = 'http://127.0.0.1:3000/uploads/foto.jpg';
    const result = normalizeFileUrl(url);
    expect(result).not.toMatch(/127\.0\.0\.1/);
    expect(result).toContain('/uploads/foto.jpg');
  });

  it('substitui localhost com https também', () => {
    const url = 'https://localhost:3000/uploads/foto.jpg';
    const result = normalizeFileUrl(url);
    expect(result).not.toMatch(/localhost/);
    expect(result).toContain('/uploads/foto.jpg');
  });

  it('não altera URL externa válida', () => {
    const url = 'https://example.com/images/foto.jpg';
    expect(normalizeFileUrl(url)).toBe(url);
  });

  it('prefixa URL relativa com barra', () => {
    const result = normalizeFileUrl('/uploads/foto.jpg');
    expect(result).toBe(`${API_BASE_URL}/uploads/foto.jpg`);
  });

  it('prefixa URL relativa sem barra', () => {
    const result = normalizeFileUrl('uploads/foto.jpg');
    expect(result).toBe(`${API_BASE_URL}/uploads/foto.jpg`);
  });

  it('não altera URL com host real (não localhost)', () => {
    const url = `${API_BASE_URL}/uploads/foto.jpg`;
    expect(normalizeFileUrl(url)).toBe(url);
  });

  it('normaliza barras invertidas em caminhos relativos', () => {
    const result = normalizeFileUrl('uploads\\boats\\foto.jpg');
    expect(result).toBe(`${API_BASE_URL}/uploads/boats/foto.jpg`);
  });
});

describe('getFilePreviewUri', () => {
  it('resolve objeto com campo url', () => {
    expect(getFilePreviewUri({url: '/uploads/foto.jpg'})).toBe(
      `${API_BASE_URL}/uploads/foto.jpg`,
    );
  });

  it('resolve objeto com campo path', () => {
    expect(getFilePreviewUri({path: 'uploads\\boats\\foto.jpg'})).toBe(
      `${API_BASE_URL}/uploads/boats/foto.jpg`,
    );
  });
});

describe('getFilePreviewCandidates', () => {
  it('inclui fallback da pasta quando recebe apenas nome do arquivo', () => {
    expect(getFilePreviewCandidates('foto 01.jpg', {folder: 'boats'})).toEqual([
      `${API_BASE_URL}/foto%2001.jpg`,
      `${API_BASE_URL}/uploads/foto%2001.jpg`,
      `${API_BASE_URL}/uploads/boats/foto%2001.jpg`,
    ]);
  });

  it('não duplica a pasta quando o caminho já inclui a pasta alvo', () => {
    expect(getFilePreviewCandidates('/uploads/documents/doc.pdf', {folder: 'documents'})).toEqual([
      `${API_BASE_URL}/uploads/documents/doc.pdf`,
    ]);
  });
});
