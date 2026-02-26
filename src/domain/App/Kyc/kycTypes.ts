export type KycStatus = 'none' | 'pending' | 'under_review' | 'approved' | 'rejected';

export interface KycData {
  kycStatus: KycStatus;
  selfieUrl?: string | null;
  licensePhotoUrl?: string | null;
  certificatePhotoUrl?: string | null;
  rnaqNumber?: string | null;
  isVerified: boolean;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
}

export interface KycSubmitData {
  selfieUrl: string;
  licensePhotoUrl: string;
  rnaqNumber?: string;
  certificatePhotoUrl?: string;
}
