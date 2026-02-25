import {boatAPI} from './boatAPI';
import {Boat, CreateBoatData} from './boatTypes';

async function getMyBoats(): Promise<Boat[]> {
  return boatAPI.getMyBoats();
}

async function getById(id: string): Promise<Boat> {
  return boatAPI.getById(id);
}

async function create(data: CreateBoatData): Promise<Boat> {
  return boatAPI.create(data);
}

async function update(id: string, data: Partial<CreateBoatData>): Promise<Boat> {
  return boatAPI.update(id, data);
}

async function remove(id: string): Promise<void> {
  return boatAPI.remove(id);
}

export const boatService = {getMyBoats, getById, create, update, remove};
