import {boatService} from '../../boatService';
import {Boat} from '../../boatTypes';

export async function getMyBoatsUseCase(): Promise<Boat[]> {
  return boatService.getMyBoats();
}
