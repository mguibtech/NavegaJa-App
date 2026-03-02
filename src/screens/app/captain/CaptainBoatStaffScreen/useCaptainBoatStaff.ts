import {useState} from 'react';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {boatStaffService, useBoatStaff, BoatStaff, UpdateBoatStaffData} from '@domain';
import {useToast} from '@services';

import {AppStackParamList} from '@routes';

type AddPerms = {canCreateTrips: boolean; canConfirmPayments: boolean; canManageShipments: boolean};

function httpErrorMsg(e: unknown): string {
  const status = (e as {statusCode?: number})?.statusCode;
  if (status === 403) return 'Este barco não pertence a você';
  if (status === 404) return 'Nenhum utilizador com este telefone';
  if (status === 400) return 'Não pode adicionar-se a si mesmo';
  if (status === 409) return 'Utilizador já é gestor deste barco';
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
    if (!staffToRemove) return;
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

  // Add
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPhone, setAddPhone] = useState('');
  const [addPerms, setAddPerms] = useState<AddPerms>({
    canCreateTrips: true,
    canConfirmPayments: true,
    canManageShipments: true,
  });
  const [addLoading, setAddLoading] = useState(false);

  async function handleAdd() {
    if (!addPhone.trim()) return;
    setAddLoading(true);
    try {
      await boatStaffService.add({
        phone: addPhone.trim(),
        boatId,
        ...addPerms,
      });
      queryClient.invalidateQueries({queryKey: queryKeys.captain.staff()});
      setShowAddModal(false);
      setAddPhone('');
      setAddPerms({canCreateTrips: true, canConfirmPayments: true, canManageShipments: true});
      showSuccess('Gestor adicionado com sucesso');
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
    if (!editingStaff) return;
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
    setShowAddModal,
    addPhone,
    setAddPhone,
    addPerms,
    setAddPerms,
    addLoading,
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
