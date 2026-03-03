import {boatStaffAPI} from './boatStaffAPI';
import {AddBoatStaffData, BoatStaff, UpdateBoatStaffData, UserLookupResult} from './boatStaffTypes';

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

async function lookupByPhone(phone: string): Promise<UserLookupResult> {
  return boatStaffAPI.lookupByPhone(phone);
}

async function lookupByCpf(cpf: string): Promise<UserLookupResult> {
  return boatStaffAPI.lookupByCpf(cpf);
}

export const boatStaffService = {getAll, add, update, remove, lookupByPhone, lookupByCpf};
