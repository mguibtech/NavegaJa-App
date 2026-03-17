import {apiClient} from '../../../api/apiClient';
import {API_ENDPOINTS} from '../../../api/config';
import {
  CreateDocumentChangeRequestData,
  DocumentChangeRequest,
  KycData,
  KycSubmitData,
} from './kycTypes';

export const kycAPI = {
  getStatus(): Promise<KycData> {
    return apiClient.get<KycData>(API_ENDPOINTS.KYC_STATUS);
  },

  submit(data: KycSubmitData): Promise<{message: string; kycStatus: string}> {
    return apiClient.post<{message: string; kycStatus: string}>(
      API_ENDPOINTS.KYC_SUBMIT,
      data,
    );
  },

  getDocumentChangeRequests(): Promise<DocumentChangeRequest[]> {
    return apiClient.get<DocumentChangeRequest[]>(API_ENDPOINTS.DOCUMENT_CHANGE_REQUESTS);
  },

  createDocumentChangeRequest(
    data: CreateDocumentChangeRequestData,
  ): Promise<DocumentChangeRequest> {
    return apiClient.post<DocumentChangeRequest>(
      API_ENDPOINTS.DOCUMENT_CHANGE_REQUESTS,
      data,
    );
  },

  approveDocumentChangeRequest(id: string): Promise<DocumentChangeRequest> {
    return apiClient.patch<DocumentChangeRequest>(
      API_ENDPOINTS.DOCUMENT_CHANGE_REQUEST_APPROVE(id),
    );
  },

  rejectDocumentChangeRequest(
    id: string,
    rejectionReason?: string,
  ): Promise<DocumentChangeRequest> {
    return apiClient.patch<DocumentChangeRequest>(
      API_ENDPOINTS.DOCUMENT_CHANGE_REQUEST_REJECT(id),
      rejectionReason ? {rejectionReason} : undefined,
    );
  },
};
