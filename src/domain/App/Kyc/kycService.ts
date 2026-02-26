import {kycAPI} from './kycAPI';
import {KycData, KycSubmitData} from './kycTypes';

export const kycService = {
  getStatus(): Promise<KycData> {
    return kycAPI.getStatus();
  },

  submit(data: KycSubmitData): Promise<{message: string; kycStatus: string}> {
    return kycAPI.submit(data);
  },
};
