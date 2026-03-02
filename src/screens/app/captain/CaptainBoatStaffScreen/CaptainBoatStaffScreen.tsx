import React from 'react';
import {FlatList, Modal, Switch, TextInput, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox, ConfirmationModal, UserAvatar} from '@components';
import {BoatStaff} from '@domain';
import {formatPhone} from '@utils';

import {useCaptainBoatStaff} from './useCaptainBoatStaff';

function CapabilityChip({label, active}: {label: string; active: boolean}) {
  return (
    <Box
      paddingHorizontal="s8"
      paddingVertical="s4"
      borderRadius="s8"
      style={{backgroundColor: active ? '#D1FAE5' : '#F3F4F6'}}>
      <Text
        preset="paragraphCaptionSmall"
        bold
        style={{color: active ? '#065F46' : '#9CA3AF'}}>
        {label}
      </Text>
    </Box>
  );
}

export function CaptainBoatStaffScreen() {
  const {top} = useSafeAreaInsets();
  const {
    navigation,
    boatName,
    staff,
    isLoading,
    staffToRemove,
    setStaffToRemove,
    removeLoading,
    handleRemove,
    showAddModal,
    setShowAddModal,
    addPhone,
    setAddPhone,
    addPerms,
    setAddPerms,
    addLoading,
    handleAdd,
    editingStaff,
    openEdit,
    setEditingStaff,
    editPerms,
    setEditPerms,
    editLoading,
    handleUpdate,
  } = useCaptainBoatStaff();

  function renderStaff({item}: {item: BoatStaff}) {
    return (
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s16"
        mb="s12"
        style={{elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.06, shadowRadius: 6}}>
        <Box flexDirection="row" alignItems="center">
          <UserAvatar userId={item.userId} avatarUrl={item.user.avatarUrl} name={item.user.name} size="sm" />
          <Box flex={1} ml="s12">
            <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
              {item.user.name}
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              {formatPhone(item.user.phone)}
            </Text>
          </Box>
          <TouchableOpacityBox padding="s8" onPress={() => openEdit(item)}>
            <Icon name="edit" size={20} color="secondary" />
          </TouchableOpacityBox>
          <TouchableOpacityBox padding="s8" onPress={() => setStaffToRemove(item)}>
            <Icon name="close" size={20} color="danger" />
          </TouchableOpacityBox>
        </Box>

        <Box flexDirection="row" gap="s8" mt="s12" flexWrap="wrap">
          <CapabilityChip label="Viagens" active={item.canCreateTrips} />
          <CapabilityChip label="Pagamentos" active={item.canConfirmPayments} />
          <CapabilityChip label="Envios" active={item.canManageShipments} />
          <Box
            paddingHorizontal="s8"
            paddingVertical="s4"
            borderRadius="s8"
            style={{backgroundColor: item.isActive ? '#DBEAFE' : '#F3F4F6'}}>
            <Text
              preset="paragraphCaptionSmall"
              bold
              style={{color: item.isActive ? '#1E40AF' : '#9CA3AF'}}>
              {item.isActive ? '● Activo' : '○ Inactivo'}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              mr="s8"
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Box flex={1}>
              <Text preset="headingSmall" color="text" bold>
                Equipa
              </Text>
              {!!boatName && (
                <Text preset="paragraphSmall" color="textSecondary">
                  {boatName}
                </Text>
              )}
            </Box>
            <TouchableOpacityBox
              backgroundColor="secondary"
              paddingHorizontal="s16"
              paddingVertical="s8"
              borderRadius="s12"
              flexDirection="row"
              alignItems="center"
              onPress={() => setShowAddModal(true)}>
              <Icon name="person-add" size={18} color="surface" />
              <Text preset="paragraphSmall" color="surface" bold ml="s4">
                Adicionar
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>

        <FlatList
          data={staff}
          keyExtractor={item => item.id}
          renderItem={renderStaff}
          contentContainerStyle={{padding: 20, paddingBottom: 100}}
          ListEmptyComponent={
            isLoading ? (
              <Box flex={1} alignItems="center" justifyContent="center" padding="s32">
                <ActivityIndicator />
              </Box>
            ) : (
              <Box flex={1} alignItems="center" justifyContent="center" padding="s32">
                <Icon name="group" size={64} color="textSecondary" />
                <Text preset="headingSmall" color="text" bold textAlign="center" mt="s20" mb="s12">
                  Sem gestores
                </Text>
                <Text preset="paragraphMedium" color="textSecondary" textAlign="center" mb="s24">
                  Adicione gestores para este barco
                </Text>
              </Box>
            )
          }
        />
      </Box>

      {/* Remove confirmation */}
      <ConfirmationModal
        visible={!!staffToRemove}
        title="Remover gestor"
        message={`Deseja remover "${staffToRemove?.user.name}" da equipa?`}
        icon="delete-outline"
        iconColor="danger"
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleRemove}
        onCancel={() => setStaffToRemove(null)}
        isLoading={removeLoading}
      />

      {/* Add modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <Box flex={1} justifyContent="flex-end" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <Box backgroundColor="surface" borderRadius="s24" padding="s24" style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
            <Box flexDirection="row" alignItems="center" mb="s20">
              <Text preset="headingSmall" color="text" bold flex={1}>
                Adicionar Gestor
              </Text>
              <TouchableOpacityBox onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color="textSecondary" />
              </TouchableOpacityBox>
            </Box>

            <Text preset="paragraphSmall" color="textSecondary" mb="s8">
              Telefone do utilizador
            </Text>
            <Box
              borderWidth={1}
              borderColor="border"
              borderRadius="s12"
              paddingHorizontal="s16"
              paddingVertical="s12"
              mb="s20">
              <TextInput
                value={addPhone}
                onChangeText={setAddPhone}
                placeholder="Ex: 92991001001"
                keyboardType="phone-pad"
                style={{fontSize: 15, color: '#111827'}}
              />
            </Box>

            <Text preset="paragraphSmall" color="textSecondary" mb="s12" bold>
              Permissões
            </Text>
            {(
              [
                {key: 'canCreateTrips', label: 'Criar viagens'} as const,
                {key: 'canConfirmPayments', label: 'Confirmar pagamentos'} as const,
                {key: 'canManageShipments', label: 'Gerir envios'} as const,
              ] as const
            ).map(({key, label}) => (
              <Box key={key} flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
                <Text preset="paragraphMedium" color="text">{label}</Text>
                <Switch
                  value={addPerms[key]}
                  onValueChange={v => setAddPerms(prev => ({...prev, [key]: v}))}
                />
              </Box>
            ))}

            <TouchableOpacityBox
              backgroundColor="secondary"
              paddingVertical="s16"
              borderRadius="s12"
              alignItems="center"
              mt="s8"
              onPress={handleAdd}
              disabled={addLoading || !addPhone.trim()}
              style={{opacity: addLoading || !addPhone.trim() ? 0.5 : 1}}>
              {addLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text preset="paragraphMedium" color="surface" bold>
                  Adicionar
                </Text>
              )}
            </TouchableOpacityBox>
          </Box>
        </Box>
      </Modal>

      {/* Edit modal */}
      <Modal visible={!!editingStaff} transparent animationType="slide" onRequestClose={() => setEditingStaff(null)}>
        <Box flex={1} justifyContent="flex-end" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <Box backgroundColor="surface" borderRadius="s24" padding="s24" style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
            <Box flexDirection="row" alignItems="center" mb="s20">
              <Text preset="headingSmall" color="text" bold flex={1}>
                Editar — {editingStaff?.user.name}
              </Text>
              <TouchableOpacityBox onPress={() => setEditingStaff(null)}>
                <Icon name="close" size={24} color="textSecondary" />
              </TouchableOpacityBox>
            </Box>

            <Text preset="paragraphSmall" color="textSecondary" mb="s12" bold>
              Permissões
            </Text>
            {(
              [
                {key: 'canCreateTrips', label: 'Criar viagens'} as const,
                {key: 'canConfirmPayments', label: 'Confirmar pagamentos'} as const,
                {key: 'canManageShipments', label: 'Gerir envios'} as const,
              ] as const
            ).map(({key, label}) => (
              <Box key={key} flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
                <Text preset="paragraphMedium" color="text">{label}</Text>
                <Switch
                  value={!!editPerms[key]}
                  onValueChange={v => setEditPerms(prev => ({...prev, [key]: v}))}
                />
              </Box>
            ))}

            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s20" mt="s4">
              <Text preset="paragraphMedium" color="text">Activo</Text>
              <Switch
                value={!!editPerms.isActive}
                onValueChange={v => setEditPerms(prev => ({...prev, isActive: v}))}
              />
            </Box>

            <TouchableOpacityBox
              backgroundColor="secondary"
              paddingVertical="s16"
              borderRadius="s12"
              alignItems="center"
              onPress={handleUpdate}
              disabled={editLoading}
              style={{opacity: editLoading ? 0.5 : 1}}>
              {editLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text preset="paragraphMedium" color="surface" bold>
                  Guardar
                </Text>
              )}
            </TouchableOpacityBox>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
