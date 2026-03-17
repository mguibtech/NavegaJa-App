import {
  CaptainDocumentType,
  DocumentChangeRequest,
} from './kycTypes';

export function getLatestDocumentChangeRequest(
  requests: DocumentChangeRequest[],
  documentType: CaptainDocumentType,
): DocumentChangeRequest | null {
  return requests
    .filter(request => request.documentType === documentType)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0] ?? null;
}

export function hasPendingDocumentChangeRequest(
  requests: DocumentChangeRequest[],
  documentType: CaptainDocumentType,
): boolean {
  const latestRequest = getLatestDocumentChangeRequest(requests, documentType);
  return latestRequest?.status === 'PENDING';
}
