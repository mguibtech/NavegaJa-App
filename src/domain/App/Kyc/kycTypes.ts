export type KycStatus = 'none' | 'pending' | 'under_review' | 'approved' | 'rejected';
export type CaptainDocumentType =
  | 'SELFIE'
  | 'LICENCA_NAVEGACAO'
  | 'CERTIFICADO_SEGURANCA';
export type DocumentChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycData {
  kycStatus: KycStatus;
  selfieUrl?: string | null;
  licensePhotoUrl?: string | null;
  certificatePhotoUrl?: string | null;
  rnaqNumber?: string | null;
  isVerified: boolean;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  documentRequests: DocumentChangeRequest[];
}

export interface KycSubmitData {
  selfieUrl: string;
  licensePhotoUrl: string;
  rnaqNumber?: string;
  certificatePhotoUrl?: string;
}

export interface DocumentChangeRequest {
  id: string;
  userId: string;
  documentType: CaptainDocumentType;
  currentDocumentUrl?: string | null;
  newDocumentUrl: string;
  status: DocumentChangeRequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  reviewer?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
}

export interface CreateDocumentChangeRequestData {
  documentType: CaptainDocumentType;
  newDocumentUrl: string;
}
