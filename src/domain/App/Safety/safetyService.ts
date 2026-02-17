/**
 * Safety Service
 * Lógica de negócio e cache offline para sistema de segurança
 */

import {Platform, PermissionsAndroid} from 'react-native';

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
const LAST_KNOWN_LOCATION_KEY = '@navegaja:last_known_location';

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
    } catch {
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
   * Salva a última posição conhecida no cache local
   */
  private async saveLastKnownLocation(location: SosLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(
        LAST_KNOWN_LOCATION_KEY,
        JSON.stringify(location),
      );
    } catch {
      // silencioso
    }
  }

  /**
   * Recupera a última posição conhecida do cache local
   */
  private async loadLastKnownLocation(): Promise<SosLocation | null> {
    try {
      const stored = await AsyncStorage.getItem(LAST_KNOWN_LOCATION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Obtém posição via Geolocation API com promise
   */
  private getPositionWithTimeout(
    enableHighAccuracy: boolean,
    timeout: number,
    maximumAge: number,
  ): Promise<SosLocation> {
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
        error => reject(error),
        {enableHighAccuracy, timeout, maximumAge},
      );
    });
  }

  /**
   * Obter localização atual do usuário
   * Estratégia: cache OS (maximumAge alto) → rede → GPS → cache local
   */
  async getCurrentLocation(): Promise<SosLocation> {
    // 1. Solicitar permissão em runtime no Android
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permissão de Localização',
          message:
            'O NavegaJá precisa acessar sua localização para acionar o SOS.',
          buttonNeutral: 'Perguntar depois',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error(
          'Permissão de localização negada. Ative nas configurações do dispositivo.',
        );
      }
    }

    // 2. Tenta usar cache do SO (última posição do sistema, instantânea)
    try {
      const cached = await this.getPositionWithTimeout(false, 3000, 300000);
      console.log('[SOS] Location from OS cache:', JSON.stringify(cached));
      await this.saveLastKnownLocation(cached);
      return cached;
    } catch {
      console.log('[SOS] OS cache miss, trying network location...');
    }

    // 3. Tenta localização por rede (rápida, sem GPS)
    try {
      const network = await this.getPositionWithTimeout(false, 8000, 0);
      console.log('[SOS] Location from network:', JSON.stringify(network));
      await this.saveLastKnownLocation(network);
      return network;
    } catch {
      console.log('[SOS] Network location failed, trying GPS...');
    }

    // 4. Tenta GPS (alta precisão, mais lento)
    try {
      const gps = await this.getPositionWithTimeout(true, 15000, 0);
      console.log('[SOS] Location from GPS:', JSON.stringify(gps));
      await this.saveLastKnownLocation(gps);
      return gps;
    } catch {
      console.log('[SOS] GPS failed, trying local cache...');
    }

    // 5. Usa última posição salva localmente (fallback final)
    const lastKnown = await this.loadLastKnownLocation();
    if (lastKnown) {
      console.log('[SOS] Using local cached location:', JSON.stringify(lastKnown));
      return lastKnown;
    }

    throw new Error(
      'Não foi possível obter sua localização. Ative o GPS e tente novamente.',
    );
  }

  /**
   * Criar alerta SOS
   */
  async createSosAlert(data: CreateSosAlertData): Promise<SosAlert> {
    const alert = await safetyAPI.createSosAlert(data);

    console.log('[SOS] Created alert from API:', JSON.stringify(alert));

    // Normaliza formato de localização
    const loc = alert.location as any;
    if (loc && loc.lat != null && alert.location?.latitude == null) {
      alert.location = {
        ...loc,
        latitude: loc.lat,
        longitude: loc.lng,
      };
    }

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

      console.log('[SOS] Alerts from API:', JSON.stringify(alerts));

      // Normaliza formato de localização (backend pode retornar lat/lng ou latitude/longitude)
      const normalized = alerts.map(alert => {
        const loc = alert.location as any;
        if (loc && loc.lat != null && alert.location?.latitude == null) {
          alert.location = {
            ...loc,
            latitude: loc.lat,
            longitude: loc.lng,
          };
        }
        return alert;
      });

      // Salvar offline
      await this.saveSosAlertsOffline(normalized);

      return normalized;
    } catch {
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
      if (activeAlerts.length === 0) {
        return null;
      }

      const alert = activeAlerts[0];

      // Se o alerta não tem localização válida, tenta obter/restaurar
      const hasValidLocation =
        alert.location?.latitude != null &&
        alert.location?.longitude != null;

      if (!hasValidLocation) {
        // Primeiro tenta o cache local
        const cachedLocation = await this.loadLastKnownLocation();
        if (cachedLocation) {
          console.log('[SOS] Using cached location for active alert');
          alert.location = cachedLocation;
        } else {
          // Se não tem cache, tenta obter localização rápida (cache do SO)
          try {
            const freshLocation = await this.getPositionWithTimeout(
              false,
              5000,
              300000,
            );
            console.log('[SOS] Got fresh location for active alert:', JSON.stringify(freshLocation));
            await this.saveLastKnownLocation(freshLocation);
            alert.location = freshLocation;
          } catch {
            console.log('[SOS] Could not get location for active alert');
          }
        }
      }

      return alert;
    } catch {
      return null;
    }
  }
}

export const safetyService = new SafetyService();
