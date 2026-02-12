import {api} from '@api';

import {ReportIncidentData} from '../../shipmentTypes';

export async function reportIncidentUseCase(
  shipmentId: string,
  data: ReportIncidentData,
): Promise<void> {
  await api.post(`/shipments/${shipmentId}/incident`, data);
}
