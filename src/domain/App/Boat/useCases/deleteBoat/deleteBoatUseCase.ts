import {api} from '@api';

export async function deleteBoatUseCase(id: string): Promise<void> {
  await api.delete(`/boats/${id}`);
}
