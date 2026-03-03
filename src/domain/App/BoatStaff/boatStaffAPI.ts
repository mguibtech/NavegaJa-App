import {api} from '@api';

import {AddBoatStaffData, BoatStaff, UpdateBoatStaffData, UserLookupResult} from './boatStaffTypes';

const PATH = '/captain/boat-staff';

async function getAll(): Promise<BoatStaff[]> {
  return api.get<BoatStaff[]>(PATH);
}

async function add(data: AddBoatStaffData): Promise<BoatStaff> {
  return api.post<BoatStaff>(PATH, data);
}

async function update(id: string, data: UpdateBoatStaffData): Promise<BoatStaff> {
  return api.patch<BoatStaff>(`${PATH}/${id}`, data);
}

async function remove(id: string): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

async function lookupByPhone(phone: string): Promise<UserLookupResult> {
  return api.get<UserLookupResult>(`${PATH}/lookup?phone=${encodeURIComponent(phone)}`);
}

async function lookupByCpf(cpf: string): Promise<UserLookupResult> {
  return api.get<UserLookupResult>(`${PATH}/lookup?cpf=${encodeURIComponent(cpf)}`);
}

export const boatStaffAPI = {getAll, add, update, remove, lookupByPhone, lookupByCpf};
