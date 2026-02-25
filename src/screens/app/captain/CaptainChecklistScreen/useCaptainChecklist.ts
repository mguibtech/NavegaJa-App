import {useEffect, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  useGetOrCreateChecklist,
  useUpdateChecklist,
  useGetChecklistStatus,
} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

export interface ChecklistState {
  lifeJacketsAvailable: boolean;
  fireExtinguisherCheck: boolean;
  weatherConditionsOk: boolean;
  boatConditionGood: boolean;
  emergencyEquipmentCheck: boolean;
  navigationLightsWorking: boolean;
  maxCapacityRespected: boolean;
}

export const CHECKLIST_LABELS: {key: keyof ChecklistState; label: string}[] = [
  {key: 'lifeJacketsAvailable', label: 'Coletes salva-vidas disponíveis para todos *'},
  {key: 'fireExtinguisherCheck', label: 'Extintor de incêndio verificado *'},
  {key: 'weatherConditionsOk', label: 'Condições climáticas avaliadas *'},
  {key: 'boatConditionGood', label: 'Embarcação em boas condições *'},
  {key: 'emergencyEquipmentCheck', label: 'Rádio e sinalizadores de emergência ok *'},
  {key: 'navigationLightsWorking', label: 'Luzes de navegação funcionando *'},
  {key: 'maxCapacityRespected', label: 'Lotação máxima respeitada *'},
];

const INITIAL_STATE: ChecklistState = {
  lifeJacketsAvailable: false,
  fireExtinguisherCheck: false,
  weatherConditionsOk: false,
  boatConditionGood: false,
  emergencyEquipmentCheck: false,
  navigationLightsWorking: false,
  maxCapacityRespected: false,
};

export function useCaptainChecklist() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainChecklist'>>();
  const {tripId} = route.params;
  const toast = useToast();

  const {checklist, isLoading, error, refetch} = useGetOrCreateChecklist(tripId);
  const {update, isLoading: isSaving} = useUpdateChecklist();
  const {getStatus} = useGetChecklistStatus();

  const [checks, setChecks] = useState<ChecklistState>(INITIAL_STATE);
  const [lifeJacketsCount, setLifeJacketsCount] = useState('');
  const [passengersOnBoard, setPassengersOnBoard] = useState('');

  const apiAvailable = !error;

  useEffect(() => {
    if (checklist) {
      setChecks({
        lifeJacketsAvailable: checklist.lifeJacketsAvailable ?? false,
        fireExtinguisherCheck: checklist.fireExtinguisherCheck ?? false,
        weatherConditionsOk: checklist.weatherConditionsOk ?? false,
        boatConditionGood: checklist.boatConditionGood ?? false,
        emergencyEquipmentCheck: checklist.emergencyEquipmentCheck ?? false,
        navigationLightsWorking: checklist.navigationLightsWorking ?? false,
        maxCapacityRespected: checklist.maxCapacityRespected ?? false,
      });
      if (checklist.lifeJacketsCount) {
        setLifeJacketsCount(String(checklist.lifeJacketsCount));
      }
      if (checklist.passengersOnBoard) {
        setPassengersOnBoard(String(checklist.passengersOnBoard));
      }
    }
  }, [checklist]);

  useEffect(() => {
    if (error) {
      toast.showError(error?.message || 'Erro ao carregar checklist. Verifique a conexão.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  function toggle(key: keyof ChecklistState) {
    setChecks(prev => ({...prev, [key]: !prev[key]}));
  }

  const allChecked = Object.values(checks).every(Boolean);
  const checkedCount = Object.values(checks).filter(Boolean).length;

  async function handleNext() {
    if (!allChecked) {
      toast.showError('Confirme todos os itens obrigatórios antes de continuar');
      return;
    }
    if (!lifeJacketsCount.trim() || Number(lifeJacketsCount) < 1) {
      toast.showError('Informe a quantidade de coletes salva-vidas');
      return;
    }
    if (!passengersOnBoard.trim()) {
      toast.showError('Informe o número de passageiros a bordo');
      return;
    }
    if (!checklist || !apiAvailable) {
      toast.showError('Não foi possível conectar ao servidor. Tente novamente.');
      return;
    }

    try {
      await update(checklist.id, tripId, {
        ...checks,
        lifeJacketsCount: Number(lifeJacketsCount),
        weatherCondition: 'Verificado',
        passengersOnBoard: Number(passengersOnBoard),
        maxCapacity: checklist.maxCapacity || Number(passengersOnBoard),
        observations: '',
      });
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao salvar checklist. Tente novamente.');
      return;
    }

    try {
      const status = await getStatus(tripId);
      if (!status.checklistComplete) {
        toast.showError('Checklist incompleto no servidor. Verifique todos os itens.');
        return;
      }
    } catch {
      // Se o endpoint de status não existir, confia no PATCH bem-sucedido
    }

    navigation.navigate('CaptainStartTrip', {tripId});
  }

  function goBack() {
    navigation.goBack();
  }

  return {
    // loading
    isLoading,
    isSaving,
    apiAvailable,
    // checklist data
    checks,
    checklist,
    lifeJacketsCount,
    setLifeJacketsCount,
    passengersOnBoard,
    setPassengersOnBoard,
    allChecked,
    checkedCount,
    // handlers
    toggle,
    handleNext,
    loadOrCreateChecklist: () => { refetch(); },
    goBack,
  };
}
