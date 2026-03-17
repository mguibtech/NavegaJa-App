import {kycAPI} from './kycAPI';
import {
  CreateDocumentChangeRequestData,
  DocumentChangeRequest,
  KycData,
  KycSubmitData,
} from './kycTypes';

export const kycService = {
  getStatus(): Promise<KycData> {
    return kycAPI.getStatus();
  },

  submit(data: KycSubmitData): Promise<{message: string; kycStatus: string}> {
    return kycAPI.submit(data);
  },

  getDocumentChangeRequests(): Promise<DocumentChangeRequest[]> {
    return kycAPI.getDocumentChangeRequests();
  },

  createDocumentChangeRequest(
    data: CreateDocumentChangeRequestData,
  ): Promise<DocumentChangeRequest> {
    return kycAPI.createDocumentChangeRequest(data);
  },

  approveDocumentChangeRequest(id: string): Promise<DocumentChangeRequest> {
    return kycAPI.approveDocumentChangeRequest(id);
  },

  rejectDocumentChangeRequest(
    id: string,
    rejectionReason?: string,
  ): Promise<DocumentChangeRequest> {
    return kycAPI.rejectDocumentChangeRequest(id, rejectionReason);
  },
};
