/**
 * Safety API
 * Endpoints para sistema de segurança
 */

import {api} from '../../../api';
import {
  EmergencyContact,
  SafetyChecklist,
  CreateSafetyChecklistData,
  UpdateSafetyChecklistData,
  ChecklistStatusResponse,
  SosAlert,
  CreateSosAlertData,
  ResolveSosAlertData,
} from './safetyTypes';

// ========== EMERGENCY CONTACTS ==========

/**
 * GET /safety/emergency-contacts
 * Lista pública de contatos de emergência
 */
async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const response = await api.get<EmergencyContact[]>(
    '/safety/emergency-contacts',
  );
  return response;
}

/**
 * POST /safety/emergency-contacts/seed
 * Seed dos números padrão (admin only)
 */
async function seedEmergencyContacts(): Promise<void> {
  await api.post('/safety/emergency-contacts/seed');
}

// ========== SAFETY CHECKLIST ==========

/**
 * POST /safety/checklists
 * Capitão cria checklist antes da viagem
 */
async function createChecklist(
  data: CreateSafetyChecklistData,
): Promise<SafetyChecklist> {
  const response = await api.post<SafetyChecklist>(
    '/safety/checklists',
    data,
  );
  return response;
}

/**
 * PATCH /safety/checklists/:id
 * Atualiza checklist (capitão)
 */
async function updateChecklist(
  id: string,
  data: UpdateSafetyChecklistData,
): Promise<SafetyChecklist> {
  const response = await api.patch<SafetyChecklist>(
    `/safety/checklists/${id}`,
    data,
  );
  return response;
}

/**
 * GET /safety/checklists/trip/:tripId/status
 * Valida se viagem pode iniciar baseado no checklist
 */
async function getChecklistStatus(tripId: string): Promise<ChecklistStatusResponse> {
  const response = await api.get<ChecklistStatusResponse>(
    `/safety/checklists/trip/${tripId}/status`,
  );
  return response;
}

/**
 * GET /safety/checklists/:id
 * Buscar checklist por ID
 */
async function getChecklistById(id: string): Promise<SafetyChecklist> {
  const response = await api.get<SafetyChecklist>(
    `/safety/checklists/${id}`,
  );
  return response;
}

/**
 * GET /safety/checklists/trip/:tripId
 * Buscar checklist de uma viagem
 */
async function getChecklistByTripId(tripId: string): Promise<SafetyChecklist | null> {
  try {
    const response = await api.get<SafetyChecklist>(
      `/safety/checklists/trip/${tripId}`,
    );
    return response;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// ========== SOS ALERTS ==========

/**
 * POST /safety/sos
 * Aciona SOS com GPS (passageiro ou capitão)
 */
async function createSosAlert(data: CreateSosAlertData): Promise<SosAlert> {
  const response = await api.post<SosAlert>('/safety/sos', data);
  return response;
}

/**
 * GET /safety/sos/active
 * Admin vê todas as emergências ativas
 */
async function getActiveSosAlerts(): Promise<SosAlert[]> {
  const response = await api.get<SosAlert[]>('/safety/sos/active');
  return response;
}

/**
 * GET /safety/sos/my-alerts
 * Minhas emergências (usuário)
 */
async function getMySosAlerts(): Promise<SosAlert[]> {
  const response = await api.get<SosAlert[]>('/safety/sos/my-alerts');
  return response;
}

/**
 * GET /safety/sos/:id
 * Buscar SOS por ID
 */
async function getSosAlertById(id: string): Promise<SosAlert> {
  const response = await api.get<SosAlert>(`/safety/sos/${id}`);
  return response;
}

/**
 * PATCH /safety/sos/:id/resolve
 * Admin ou capitão resolve emergência
 */
async function resolveSosAlert(
  id: string,
  data?: ResolveSosAlertData,
): Promise<SosAlert> {
  const response = await api.patch<SosAlert>(
    `/safety/sos/${id}/resolve`,
    data,
  );
  return response;
}

/**
 * PATCH /safety/sos/:id/cancel
 * Usuário cancela próprio SOS
 */
async function cancelSosAlert(id: string): Promise<SosAlert> {
  const response = await api.patch<SosAlert>(`/safety/sos/${id}/cancel`);
  return response;
}

/**
 * DELETE /safety/sos/:id
 * Deletar SOS (admin only)
 */
async function deleteSosAlert(id: string): Promise<void> {
  await api.delete(`/safety/sos/${id}`);
}

export const safetyAPI = {
  getEmergencyContacts,
  seedEmergencyContacts,
  createChecklist,
  updateChecklist,
  getChecklistStatus,
  getChecklistById,
  getChecklistByTripId,
  createSosAlert,
  getActiveSosAlerts,
  getMySosAlerts,
  getSosAlertById,
  resolveSosAlert,
  cancelSosAlert,
  deleteSosAlert,
};
