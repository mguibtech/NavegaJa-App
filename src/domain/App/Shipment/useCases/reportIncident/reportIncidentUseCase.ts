import {shipmentService} from '../../shipmentService';
import {ReportIncidentData} from '../../shipmentTypes';

export async function reportIncidentUseCase(
  shipmentId: string,
  data: ReportIncidentData,
): Promise<void> {
  await shipmentService.reportIncident(shipmentId, data);
}
