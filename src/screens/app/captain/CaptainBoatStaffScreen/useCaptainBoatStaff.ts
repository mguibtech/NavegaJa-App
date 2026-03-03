import {useState} from 'react';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {boatStaffService, useBoatStaff, BoatStaff, UpdateBoatStaffData, UserLookupResult} from '@domain';
import {useToast} from '@hooks';

import {formatPhone} from '@utils';

import {AppStackParamList} from '@routes';

type AddPerms = {canCreateTrips: boolean; canConfirmPayments: boolean; canManageShipments: boolean};
export type LookupMode = 'phone' | 'cpf';

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  let f = numbers;
  if (numbers.length > 3) {f = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;}
  if (numbers.length > 6) {f = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;}
  if (numbers.length > 9) {f = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;}
  return f;
}

function httpErrorMsg(e: unknown): string {
  const status = (e as {statusCode?: number})?.statusCode;
  if (status === 403) {return 'Este barco não pertence a você';}
  if (status === 404) {return 'Nenhum utilizador encontrado';}
  if (status === 400) {return 'Não pode adicionar-se a si mesmo';}
  if (status === 409) {return 'Utilizador já é gestor deste barco';}
  return 'Erro ao processar pedido';
}

export function useCaptainBoatStaff() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainBoatStaff'>>();
  const {boatId, boatName} = route.params;
  const queryClient = useQueryClient();
  const {showError, showSuccess} = useToast();

  const {staff: allStaff, isLoading} = useBoatStaff();
  const staff = allStaff.filter(s => s.boatId === boatId);

  // Remove
  const [staffToRemove, setStaffToRemove] = useState<BoatStaff | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  async function handleRemove() {
    if (!staffToRemove) {return;}
    setRemoveLoading(true);
    try {
      await boatStaffService.remove(staffToRemove.id);
      queryClient.invalidateQueries({queryKey: queryKeys.captain.staff()});
      setStaffToRemove(null);
    } catch (e) {
      showError(httpErrorMsg(e));
    } finally {
      setRemoveLoading(false);
    }
  }

  // ── Add — fluxo dois passos ──────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState<'search' | 'confirm'>('search');
  const [lookupMode, setLookupMode] = useState<LookupMode>('phone');
  const [addPhone, setAddPhone] = useState('');
  const [addCpf, setAddCpf] = useState('');
  const [lookedUpUser, setLookedUpUser] = useState<UserLookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [addPerms, setAddPerms] = useState<AddPerms>({
    canCreateTrips: true,
    canConfirmPayments: true,
    canManageShipments: true,
  });
  const [addLoading, setAddLoading] = useState(false);

  function handleOpenAddModal() {
    setAddStep('search');
    setLookupMode('phone');
    setAddPhone('');
    setAddCpf('');
    setLookedUpUser(null);
    setLookupError(null);
    setAddPerms({canCreateTrips: true, canConfirmPayments: true, canManageShipments: true});
    setShowAddModal(true);
  }

  function handleCloseAddModal() {
    setShowAddModal(false);
  }

  function handleSetLookupMode(mode: LookupMode) {
    setLookupMode(mode);
    setLookupError(null);
  }

  function handleAddCpfChange(value: string) {
    setAddCpf(formatCPF(value));
    if (lookupError) {setLookupError(null);}
  }

  function handleAddPhoneChange(value: string) {
    setAddPhone(formatPhone(value));
    if (lookupError) {setLookupError(null);}
  }

  const canLookup = lookupMode === 'phone'
    ? addPhone.replace(/\D/g, '').length >= 8
    : addCpf.replace(/\D/g, '').length === 11;

  async function handleLookup() {
    setLookupLoading(true);
    setLookupError(null);
    try {
      let user: UserLookupResult;
      if (lookupMode === 'phone') {
        user = await boatStaffService.lookupByPhone(addPhone.replace(/\D/g, ''));
      } else {
        user = await boatStaffService.lookupByCpf(addCpf.replace(/\D/g, ''));
      }
      setLookedUpUser(user);
      setAddStep('confirm');
    } catch (e: any) {
      const status = (e as {statusCode?: number})?.statusCode;
      if (status === 404) {
        setLookupError(`Nenhum utilizador encontrado com este ${lookupMode === 'phone' ? 'telefone' : 'CPF'}`);
      } else if (status === 401 || status === 403) {
        setLookupError('Sem permissão para realizar esta operação');
      } else {
        setLookupError(e?.message || `Erro ${status ?? 'de rede'}. Verifique a ligação ao servidor.`);
      }
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleAdd() {
    if (!lookedUpUser) {return;}
    setAddLoading(true);
    try {
      await boatStaffService.add({
        ...(lookupMode === 'phone'
          ? {phone: addPhone.replace(/\D/g, '')}
          : {cpf: addCpf.replace(/\D/g, '')}),
        boatId,
        ...addPerms,
      });
      queryClient.invalidateQueries({queryKey: queryKeys.captain.staff()});
      setShowAddModal(false);
      showSuccess(`${lookedUpUser.name} adicionado à equipa`);
    } catch (e) {
      showError(httpErrorMsg(e));
    } finally {
      setAddLoading(false);
    }
  }

  // Edit
  const [editingStaff, setEditingStaff] = useState<BoatStaff | null>(null);
  const [editPerms, setEditPerms] = useState<UpdateBoatStaffData>({});
  const [editLoading, setEditLoading] = useState(false);

  function openEdit(member: BoatStaff) {
    setEditingStaff(member);
    setEditPerms({
      canCreateTrips: member.canCreateTrips,
      canConfirmPayments: member.canConfirmPayments,
      canManageShipments: member.canManageShipments,
      isActive: member.isActive,
    });
  }

  async function handleUpdate() {
    if (!editingStaff) {return;}
    setEditLoading(true);
    try {
      await boatStaffService.update(editingStaff.id, editPerms);
      queryClient.invalidateQueries({queryKey: queryKeys.captain.staff()});
      setEditingStaff(null);
    } catch (e) {
      showError(httpErrorMsg(e));
    } finally {
      setEditLoading(false);
    }
  }

  return {
    navigation,
    boatName,
    staff,
    isLoading,
    // remove
    staffToRemove,
    setStaffToRemove,
    removeLoading,
    handleRemove,
    // add
    showAddModal,
    addStep,
    setAddStep,
    lookupMode,
    handleSetLookupMode,
    addPhone,
    handleAddPhoneChange,
    addCpf,
    handleAddCpfChange,
    lookedUpUser,
    lookupLoading,
    lookupError,
    canLookup,
    addPerms,
    setAddPerms,
    addLoading,
    handleOpenAddModal,
    handleCloseAddModal,
    handleLookup,
    handleAdd,
    // edit
    editingStaff,
    openEdit,
    setEditingStaff,
    editPerms,
    setEditPerms,
    editLoading,
    handleUpdate,
  };
}
