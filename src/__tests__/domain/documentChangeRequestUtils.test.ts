import {
  getLatestDocumentChangeRequest,
  hasPendingDocumentChangeRequest,
} from '../../domain/App/Kyc/documentChangeRequestUtils';

describe('documentChangeRequestUtils', () => {
  const requests = [
    {
      id: '1',
      userId: 'u1',
      documentType: 'LICENCA_NAVEGACAO' as const,
      currentDocumentUrl: 'old-license.jpg',
      newDocumentUrl: 'new-license-1.jpg',
      status: 'REJECTED' as const,
      createdAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: '2',
      userId: 'u1',
      documentType: 'LICENCA_NAVEGACAO' as const,
      currentDocumentUrl: 'old-license.jpg',
      newDocumentUrl: 'new-license-2.jpg',
      status: 'PENDING' as const,
      createdAt: '2026-03-02T10:00:00.000Z',
    },
    {
      id: '3',
      userId: 'u1',
      documentType: 'CERTIFICADO_SEGURANCA' as const,
      currentDocumentUrl: 'old-cert.jpg',
      newDocumentUrl: 'new-cert.jpg',
      status: 'APPROVED' as const,
      createdAt: '2026-03-03T10:00:00.000Z',
    },
  ];

  it('retorna a solicitação mais recente por tipo de documento', () => {
    expect(getLatestDocumentChangeRequest(requests, 'LICENCA_NAVEGACAO')?.id).toBe('2');
    expect(getLatestDocumentChangeRequest(requests, 'CERTIFICADO_SEGURANCA')?.id).toBe('3');
  });

  it('detecta se o tipo de documento possui solicitação pendente', () => {
    expect(hasPendingDocumentChangeRequest(requests, 'LICENCA_NAVEGACAO')).toBe(true);
    expect(hasPendingDocumentChangeRequest(requests, 'CERTIFICADO_SEGURANCA')).toBe(false);
  });
});
