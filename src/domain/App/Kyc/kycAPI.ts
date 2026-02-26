import {apiClient} from '../../../api/apiClient';
import {API_ENDPOINTS} from '../../../api/config';
import {KycData, KycSubmitData} from './kycTypes';

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
};
