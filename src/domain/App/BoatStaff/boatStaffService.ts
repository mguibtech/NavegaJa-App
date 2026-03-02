import {boatStaffAPI} from './boatStaffAPI';
import {AddBoatStaffData, BoatStaff, UpdateBoatStaffData} from './boatStaffTypes';

async function getAll(): Promise<BoatStaff[]> {
  return boatStaffAPI.getAll();
}

async function add(data: AddBoatStaffData): Promise<BoatStaff> {
  return boatStaffAPI.add(data);
}

async function update(id: string, data: UpdateBoatStaffData): Promise<BoatStaff> {
  return boatStaffAPI.update(id, data);
}

async function remove(id: string): Promise<void> {
  return boatStaffAPI.remove(id);
}

export const boatStaffService = {getAll, add, update, remove};
