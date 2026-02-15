/**
 * Safety Service
 * Lógica de negócio e cache offline para sistema de segurança
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

import {safetyAPI} from './safetyAPI';
import {
  EmergencyContact,
  SafetyChecklist,
  CreateSafetyChecklistData,
  UpdateSafetyChecklistData,
  ChecklistStatusResponse,
  SosAlert,
  CreateSosAlertData,
  ResolveSosAlertData,
  SosLocation,
} from './safetyTypes';

const EMERGENCY_CONTACTS_KEY = '@navegaja:emergency_contacts';
const SOS_ALERTS_KEY = '@navegaja:sos_alerts';

class SafetyService {
  // ========== EMERGENCY CONTACTS ==========

  /**
   * Buscar contatos de emergência (com cache offline)
   */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const contacts = await safetyAPI.getEmergencyContacts();

      // Salvar offline
      await this.saveEmergencyContactsOffline(contacts);

      return contacts;
    } catch (error) {
      // Se falhar, tenta carregar do cache
      console.warn(
        'Failed to fetch emergency contacts from API, loading from cache',
      );
      return await this.loadEmergencyContactsOffline();
    }
  }

  /**
   * Salvar contatos offline
   */
  private async saveEmergencyContactsOffline(
    contacts: EmergencyContact[],
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        EMERGENCY_CONTACTS_KEY,
        JSON.stringify(contacts),
      );
    } catch (error) {
      console.error('Error saving emergency contacts offline:', error);
    }
  }

  /**
   * Carregar contatos do cache offline
   */
  async loadEmergencyContactsOffline(): Promise<EmergencyContact[]> {
    try {
      const stored = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading emergency contacts from offline:', error);
      return [];
    }
  }

  // ========== SAFETY CHECKLIST ==========

  /**
   * Criar checklist de segurança (capitão)
   */
  async createChecklist(
    data: CreateSafetyChecklistData,
  ): Promise<SafetyChecklist> {
    return await safetyAPI.createChecklist(data);
  }

  /**
   * Atualizar checklist
   */
  async updateChecklist(
    id: string,
    data: UpdateSafetyChecklistData,
  ): Promise<SafetyChecklist> {
    return await safetyAPI.updateChecklist(id, data);
  }

  /**
   * Verificar status do checklist de uma viagem
   */
  async getChecklistStatus(tripId: string): Promise<ChecklistStatusResponse> {
    return await safetyAPI.getChecklistStatus(tripId);
  }

  /**
   * Buscar checklist por ID
   */
  async getChecklistById(id: string): Promise<SafetyChecklist> {
    return await safetyAPI.getChecklistById(id);
  }

  /**
   * Buscar checklist de uma viagem
   */
  async getChecklistByTripId(tripId: string): Promise<SafetyChecklist | null> {
    return await safetyAPI.getChecklistByTripId(tripId);
  }

  // ========== SOS ALERTS ==========

  /**
   * Obter localização atual do usuário
   */
  async getCurrentLocation(): Promise<SosLocation> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        error => {
          reject(new Error(`Erro ao obter localização: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  /**
   * Criar alerta SOS
   */
  async createSosAlert(data: CreateSosAlertData): Promise<SosAlert> {
    const alert = await safetyAPI.createSosAlert(data);

    // Salvar offline
    const stored = await this.loadSosAlertsOffline();
    await this.saveSosAlertsOffline([alert, ...stored]);

    return alert;
  }

  /**
   * Buscar alertas SOS ativos (admin)
   */
  async getActiveSosAlerts(): Promise<SosAlert[]> {
    return await safetyAPI.getActiveSosAlerts();
  }

  /**
   * Buscar meus alertas SOS
   */
  async getMySosAlerts(): Promise<SosAlert[]> {
    try {
      const alerts = await safetyAPI.getMySosAlerts();

      // Salvar offline
      await this.saveSosAlertsOffline(alerts);

      return alerts;
    } catch (error) {
      console.warn('Failed to fetch SOS alerts from API, loading from cache');
      return await this.loadSosAlertsOffline();
    }
  }

  /**
   * Buscar SOS por ID
   */
  async getSosAlertById(id: string): Promise<SosAlert> {
    return await safetyAPI.getSosAlertById(id);
  }

  /**
   * Resolver alerta SOS (admin/capitão)
   */
  async resolveSosAlert(
    id: string,
    data?: ResolveSosAlertData,
  ): Promise<SosAlert> {
    const alert = await safetyAPI.resolveSosAlert(id, data);

    // Atualizar cache offline
    const stored = await this.loadSosAlertsOffline();
    const updated = stored.map(a => (a.id === id ? alert : a));
    await this.saveSosAlertsOffline(updated);

    return alert;
  }

  /**
   * Cancelar alerta SOS (usuário)
   */
  async cancelSosAlert(id: string): Promise<SosAlert> {
    const alert = await safetyAPI.cancelSosAlert(id);

    // Atualizar cache offline
    const stored = await this.loadSosAlertsOffline();
    const updated = stored.map(a => (a.id === id ? alert : a));
    await this.saveSosAlertsOffline(updated);

    return alert;
  }

  /**
   * Deletar alerta SOS (admin)
   */
  async deleteSosAlert(id: string): Promise<void> {
    await safetyAPI.deleteSosAlert(id);

    // Remover do cache offline
    const stored = await this.loadSosAlertsOffline();
    const filtered = stored.filter(a => a.id !== id);
    await this.saveSosAlertsOffline(filtered);
  }

  /**
   * Salvar alertas SOS offline
   */
  private async saveSosAlertsOffline(alerts: SosAlert[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SOS_ALERTS_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving SOS alerts offline:', error);
    }
  }

  /**
   * Carregar alertas SOS do cache offline
   */
  async loadSosAlertsOffline(): Promise<SosAlert[]> {
    try {
      const stored = await AsyncStorage.getItem(SOS_ALERTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading SOS alerts from offline:', error);
      return [];
    }
  }

  /**
   * Verificar se há alertas SOS ativos do usuário
   */
  async hasActiveAlert(): Promise<boolean> {
    try {
      const alerts = await this.getMySosAlerts();
      return alerts.some(alert => alert.status === 'active');
    } catch {
      return false;
    }
  }

  /**
   * Obter último alerta SOS ativo do usuário
   */
  async getActiveAlert(): Promise<SosAlert | null> {
    try {
      const alerts = await this.getMySosAlerts();
      const activeAlerts = alerts.filter(alert => alert.status === 'active');
      return activeAlerts.length > 0 ? activeAlerts[0] : null;
    } catch {
      return null;
    }
  }
}

export const safetyService = new SafetyService();
