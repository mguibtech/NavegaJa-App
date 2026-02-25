import {boatService} from '../../boatService';

export async function deleteBoatUseCase(id: string): Promise<void> {
  return boatService.remove(id);
}
