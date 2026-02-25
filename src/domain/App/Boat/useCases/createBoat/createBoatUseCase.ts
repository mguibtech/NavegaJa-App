import {boatService} from '../../boatService';
import {Boat, CreateBoatData} from '../../boatTypes';

export async function createBoatUseCase(data: CreateBoatData): Promise<Boat> {
  return boatService.create(data);
}
