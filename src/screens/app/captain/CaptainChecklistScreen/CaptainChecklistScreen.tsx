import React, {useEffect, useState} from 'react';
import {ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {captainAPI, CaptainChecklist} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainChecklist'>;

interface ChecklistState {
  lifeJacketsAvailable: boolean;
  fireExtinguisherCheck: boolean;
  weatherConditionsOk: boolean;
  boatConditionGood: boolean;
  emergencyEquipmentCheck: boolean;
  navigationLightsWorking: boolean;
  maxCapacityRespected: boolean;
}

const CHECKLIST_LABELS: {key: keyof ChecklistState; label: string}[] = [
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

export function CaptainChecklistScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();

  const [checklist, setChecklist] = useState<CaptainChecklist | null>(null);
  const [checks, setChecks] = useState<ChecklistState>(INITIAL_STATE);
  const [lifeJacketsCount, setLifeJacketsCount] = useState('');
  const [passengersOnBoard, setPassengersOnBoard] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    loadOrCreateChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrCreateChecklist() {
    setIsLoading(true);
    try {
      // Tenta buscar checklist existente
      let existing: CaptainChecklist | null = null;
      try {
        existing = await captainAPI.getChecklistByTrip(tripId);
      } catch (err: any) {
        // 404 = não existe ainda → criar
        if (err?.statusCode === 404 || !existing) {
          existing = null;
        } else {
          throw err;
        }
      }

      if (!existing) {
        existing = await captainAPI.createChecklist(tripId);
      }

      setChecklist(existing);
      setApiAvailable(true);
      setChecks({
        lifeJacketsAvailable: existing.lifeJacketsAvailable ?? false,
        fireExtinguisherCheck: existing.fireExtinguisherCheck ?? false,
        weatherConditionsOk: existing.weatherConditionsOk ?? false,
        boatConditionGood: existing.boatConditionGood ?? false,
        emergencyEquipmentCheck: existing.emergencyEquipmentCheck ?? false,
        navigationLightsWorking: existing.navigationLightsWorking ?? false,
        maxCapacityRespected: existing.maxCapacityRespected ?? false,
      });
      if (existing.lifeJacketsCount) {
        setLifeJacketsCount(String(existing.lifeJacketsCount));
      }
      if (existing.passengersOnBoard) {
        setPassengersOnBoard(String(existing.passengersOnBoard));
      }
    } catch (err: any) {
      setApiAvailable(false);
      toast.showError(err?.message || 'Erro ao carregar checklist. Verifique a conexão.');
    } finally {
      setIsLoading(false);
    }
  }

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

    setIsSaving(true);
    try {
      // Salva o checklist — obrigatório, não pode falhar silenciosamente
      await captainAPI.updateChecklist(checklist.id, {
        ...checks,
        lifeJacketsCount: Number(lifeJacketsCount),
        weatherCondition: 'Verificado',
        passengersOnBoard: Number(passengersOnBoard),
        maxCapacity: checklist.maxCapacity || Number(passengersOnBoard),
        observations: '',
      });
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao salvar checklist. Tente novamente.');
      setIsSaving(false);
      return; // bloqueia navegação
    }

    try {
      // Verifica se o backend confirmou o checklist como completo
      const status = await captainAPI.getChecklistStatus(tripId);
      if (!status.checklistComplete) {
        toast.showError('Checklist incompleto no servidor. Verifique todos os itens.');
        setIsSaving(false);
        return;
      }
    } catch {
      // Se o endpoint de status não existir, confia no PATCH bem-sucedido
    }

    setIsSaving(false);
    navigation.navigate('CaptainStartTrip', {tripId});
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.goBack()}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Box alignItems="center">
              <Text preset="headingSmall" color="text" bold>
                Checklist de Segurança
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary">
                Passo 1 de 2 — Confirme os itens antes de iniciar
              </Text>
            </Box>
          </Box>
        </Box>

        {isLoading ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator size="large" color="#0a6fbd" />
            <Text preset="paragraphSmall" color="textSecondary" mt="s16">
              Carregando checklist...
            </Text>
          </Box>
        ) : (
          <ScrollView
            contentContainerStyle={{padding: 20, paddingBottom: 120}}
            keyboardShouldPersistTaps="handled">

            {/* API indisponível */}
            {!apiAvailable && (
              <Box
                backgroundColor="dangerBg"
                borderRadius="s12"
                padding="s16"
                mb="s16"
                flexDirection="row"
                alignItems="center">
                <Icon name="cloud-off" size={22} color="danger" />
                <Box flex={1} ml="s12">
                  <Text preset="paragraphSmall" color="danger" bold>
                    Servidor indisponível
                  </Text>
                  <Text preset="paragraphCaptionSmall" color="danger">
                    O checklist precisa ser salvo no servidor para iniciar a viagem.
                  </Text>
                </Box>
                <TouchableOpacityBox onPress={loadOrCreateChecklist} padding="s8">
                  <Icon name="refresh" size={20} color="danger" />
                </TouchableOpacityBox>
              </Box>
            )}

            {/* Info Banner */}
            <Box
              backgroundColor="secondaryBg"
              borderRadius="s12"
              padding="s16"
              mb="s20"
              flexDirection="row"
              alignItems="flex-start">
              <Icon name="security" size={22} color="secondary" />
              <Box flex={1} ml="s12">
                <Text preset="paragraphSmall" color="text" bold mb="s4">
                  Verificação de segurança obrigatória
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  Todos os itens marcados com * são obrigatórios para iniciar a viagem.
                </Text>
              </Box>
            </Box>

            {/* Checklist Items */}
            {CHECKLIST_LABELS.map(({key, label}) => (
              <TouchableOpacityBox
                key={key}
                backgroundColor="surface"
                borderRadius="s12"
                padding="s16"
                mb="s8"
                flexDirection="row"
                alignItems="center"
                borderWidth={1}
                borderColor={checks[key] ? 'secondary' : 'border'}
                onPress={() => toggle(key)}>
                <Box
                  width={24}
                  height={24}
                  borderWidth={2}
                  borderColor={checks[key] ? 'secondary' : 'border'}
                  backgroundColor={checks[key] ? 'secondary' : 'background'}
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={{borderRadius: 4}}>
                  {checks[key] && <Icon name="check" size={14} color="surface" />}
                </Box>
                <Text preset="paragraphSmall" color="text" flex={1}>
                  {label}
                </Text>
              </TouchableOpacityBox>
            ))}

            {/* Campos numéricos obrigatórios */}
            <Box mt="s16" mb="s8">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Dados da viagem
              </Text>
              <Box mb="s12">
                <TextInput
                  placeholder="Quantidade de coletes salva-vidas *"
                  value={lifeJacketsCount}
                  onChangeText={v => setLifeJacketsCount(v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  leftIcon="security"
                />
              </Box>
              <Box mb="s12">
                <TextInput
                  placeholder="Passageiros a bordo *"
                  value={passengersOnBoard}
                  onChangeText={v => setPassengersOnBoard(v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  leftIcon="people"
                />
              </Box>
            </Box>

            {/* Progress */}
            <Box mb="s24" alignItems="center">
              <Text preset="paragraphCaptionSmall" color="textSecondary">
                {checkedCount} de {CHECKLIST_LABELS.length} itens verificados
              </Text>
              {!allChecked && (
                <Text preset="paragraphCaptionSmall" color="danger" mt="s4">
                  Confirme todos os itens para continuar
                </Text>
              )}
            </Box>

            <Button
              title={isSaving ? 'Salvando...' : 'Verificar Condições Climáticas'}
              onPress={handleNext}
              disabled={!allChecked || isSaving || !apiAvailable}
            />
          </ScrollView>
        )}
      </Box>
    </KeyboardAvoidingView>
  );
}
