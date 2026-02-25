import {boatService} from '../../boatService';
import {Boat, CreateBoatData} from '../../boatTypes';

export async function updateBoatUseCase(
  id: string,
  data: Partial<CreateBoatData>,
): Promise<Boat> {
  return boatService.update(id, data);
}
