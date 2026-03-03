import React from 'react';
import {FlatList, Modal, Switch, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TextInput, TouchableOpacityBox, ConfirmationModal, UserAvatar} from '@components';
import {BoatStaff} from '@domain';
import {formatPhone} from '@utils';

import {useCaptainBoatStaff} from './useCaptainBoatStaff';

const PERMS = [
  {key: 'canCreateTrips', label: 'Criar viagens'} as const,
  {key: 'canConfirmPayments', label: 'Confirmar pagamentos'} as const,
  {key: 'canManageShipments', label: 'Gerir envios'} as const,
];

function CapabilityChip({label, active}: {label: string; active: boolean}) {
  return (
    <Box
      paddingHorizontal="s8"
      paddingVertical="s4"
      borderRadius="s8"
      style={{backgroundColor: active ? '#D1FAE5' : '#F3F4F6'}}>
      <Text preset="paragraphCaptionSmall" bold style={{color: active ? '#065F46' : '#9CA3AF'}}>
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
            <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>{item.user.name}</Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">{formatPhone(item.user.phone)}</Text>
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
            paddingHorizontal="s8" paddingVertical="s4" borderRadius="s8"
            style={{backgroundColor: item.isActive ? '#DBEAFE' : '#F3F4F6'}}>
            <Text preset="paragraphCaptionSmall" bold style={{color: item.isActive ? '#1E40AF' : '#9CA3AF'}}>
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
          paddingHorizontal="s24" paddingBottom="s12"
          borderBottomWidth={1} borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40} height={40} alignItems="center" justifyContent="center" mr="s8"
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Box flex={1}>
              <Text preset="headingSmall" color="text" bold>Equipa</Text>
              {!!boatName && <Text preset="paragraphSmall" color="textSecondary">{boatName}</Text>}
            </Box>
            <TouchableOpacityBox
              backgroundColor="secondary"
              paddingHorizontal="s16" paddingVertical="s8" borderRadius="s12"
              flexDirection="row" alignItems="center"
              onPress={handleOpenAddModal}>
              <Icon name="person-add" size={18} color="surface" />
              <Text preset="paragraphSmall" color="surface" bold ml="s4">Adicionar</Text>
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

      {/* ── Remover ─────────────────────────────────────────────────────── */}
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

      {/* ── Adicionar — dois passos ──────────────────────────────────────── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={handleCloseAddModal}>
        <Box flex={1} justifyContent="flex-end" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <Box backgroundColor="surface" padding="s24" style={{borderTopLeftRadius: 24, borderTopRightRadius: 24}}>

            {/* Cabeçalho */}
            <Box flexDirection="row" alignItems="center" mb="s20">
              {addStep === 'confirm' && (
                <TouchableOpacityBox
                  width={36} height={36} borderRadius="s20"
                  backgroundColor="background"
                  alignItems="center" justifyContent="center" mr="s12"
                  onPress={() => setAddStep('search')}>
                  <Icon name="arrow-back" size={20} color="text" />
                </TouchableOpacityBox>
              )}
              <Text preset="headingSmall" color="text" bold flex={1}>
                {addStep === 'search' ? 'Adicionar Gestor' : 'Confirmar Adição'}
              </Text>
              <TouchableOpacityBox onPress={handleCloseAddModal}>
                <Icon name="close" size={24} color="textSecondary" />
              </TouchableOpacityBox>
            </Box>

            {/* ── Passo 1: Buscar por telefone ou CPF ────────────────────── */}
            {addStep === 'search' && (
              <>
                {/* Toggle Telefone / CPF */}
                <Box
                  flexDirection="row"
                  backgroundColor="background"
                  borderRadius="s12"
                  padding="s4"
                  mb="s16">
                  <TouchableOpacityBox
                    flex={1}
                    paddingVertical="s8"
                    borderRadius="s8"
                    alignItems="center"
                    style={{backgroundColor: lookupMode === 'phone' ? '#FFFFFF' : 'transparent'}}
                    onPress={() => handleSetLookupMode('phone')}>
                    <Text
                      preset="paragraphSmall"
                      bold
                      style={{color: lookupMode === 'phone' ? '#0B5D8A' : '#9CA3AF'}}>
                      Telefone
                    </Text>
                  </TouchableOpacityBox>
                  <TouchableOpacityBox
                    flex={1}
                    paddingVertical="s8"
                    borderRadius="s8"
                    alignItems="center"
                    style={{backgroundColor: lookupMode === 'cpf' ? '#FFFFFF' : 'transparent'}}
                    onPress={() => handleSetLookupMode('cpf')}>
                    <Text
                      preset="paragraphSmall"
                      bold
                      style={{color: lookupMode === 'cpf' ? '#0B5D8A' : '#9CA3AF'}}>
                      CPF
                    </Text>
                  </TouchableOpacityBox>
                </Box>

                <Box mb="s16">
                  {lookupMode === 'phone' ? (
                    <TextInput
                      label="Telefone do utilizador"
                      placeholder="+55 (92) 99999-9999"
                      value={addPhone}
                      onChangeText={handleAddPhoneChange}
                      keyboardType="phone-pad"
                      leftIcon="phone"
                      maxLength={15}
                      errorMessage={lookupError || undefined}
                    />
                  ) : (
                    <TextInput
                      label="CPF do utilizador"
                      placeholder="000.000.000-00"
                      value={addCpf}
                      onChangeText={handleAddCpfChange}
                      keyboardType="numeric"
                      leftIcon="badge"
                      maxLength={14}
                      errorMessage={lookupError || undefined}
                    />
                  )}
                </Box>

                <TouchableOpacityBox
                  backgroundColor="secondary"
                  paddingVertical="s16" borderRadius="s12"
                  flexDirection="row" alignItems="center" justifyContent="center" gap="s8"
                  onPress={handleLookup}
                  disabled={lookupLoading || !canLookup}
                  style={{opacity: lookupLoading || !canLookup ? 0.5 : 1}}>
                  {lookupLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Icon name="search" size={20} color="surface" />
                      <Text preset="paragraphMedium" color="surface" bold>Buscar</Text>
                    </>
                  )}
                </TouchableOpacityBox>
              </>
            )}

            {/* ── Passo 2: Confirmar utilizador + permissões ────────────── */}
            {addStep === 'confirm' && lookedUpUser && (
              <>
                {/* Card do utilizador encontrado */}
                <Box
                  backgroundColor="background" borderRadius="s12" padding="s16"
                  flexDirection="row" alignItems="center" mb="s20">
                  <UserAvatar
                    userId={lookedUpUser.id}
                    avatarUrl={lookedUpUser.avatarUrl}
                    name={lookedUpUser.name}
                    size="md"
                  />
                  <Box flex={1} ml="s12">
                    <Text preset="paragraphMedium" color="text" bold>{lookedUpUser.name}</Text>
                    <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                      {formatPhone(lookedUpUser.phone)}
                    </Text>
                  </Box>
                  <Icon name="check-circle" size={22} color={'#16A34A' as any} />
                </Box>

                {/* Permissões */}
                <Text preset="paragraphSmall" color="textSecondary" mb="s12" bold>Permissões</Text>
                {PERMS.map(({key, label}) => (
                  <Box key={key} flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
                    <Text preset="paragraphMedium" color="text">{label}</Text>
                    <Switch
                      value={addPerms[key]}
                      onValueChange={v => setAddPerms(prev => ({...prev, [key]: v}))}
                      trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
                      thumbColor={addPerms[key] ? '#2563EB' : '#9CA3AF'}
                    />
                  </Box>
                ))}

                <TouchableOpacityBox
                  backgroundColor="secondary"
                  paddingVertical="s16" borderRadius="s12"
                  flexDirection="row" alignItems="center" justifyContent="center" gap="s8"
                  mt="s8"
                  onPress={handleAdd}
                  disabled={addLoading}
                  style={{opacity: addLoading ? 0.5 : 1}}>
                  {addLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Icon name="person-add" size={20} color="surface" />
                      <Text preset="paragraphMedium" color="surface" bold>Adicionar à Equipa</Text>
                    </>
                  )}
                </TouchableOpacityBox>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      {/* ── Editar ───────────────────────────────────────────────────────── */}
      <Modal visible={!!editingStaff} transparent animationType="slide" onRequestClose={() => setEditingStaff(null)}>
        <Box flex={1} justifyContent="flex-end" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <Box backgroundColor="surface" padding="s24" style={{borderTopLeftRadius: 24, borderTopRightRadius: 24}}>

            {/* Header com avatar */}
            <Box flexDirection="row" alignItems="center" mb="s20">
              {editingStaff && (
                <UserAvatar
                  userId={editingStaff.userId}
                  avatarUrl={editingStaff.user.avatarUrl}
                  name={editingStaff.user.name}
                  size="sm"
                />
              )}
              <Box flex={1} ml="s12">
                <Text preset="headingSmall" color="text" bold>{editingStaff?.user.name}</Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {editingStaff ? formatPhone(editingStaff.user.phone) : ''}
                </Text>
              </Box>
              <TouchableOpacityBox onPress={() => setEditingStaff(null)}>
                <Icon name="close" size={24} color="textSecondary" />
              </TouchableOpacityBox>
            </Box>

            <Text preset="paragraphSmall" color="textSecondary" mb="s12" bold>Permissões</Text>
            {PERMS.map(({key, label}) => (
              <Box key={key} flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
                <Text preset="paragraphMedium" color="text">{label}</Text>
                <Switch
                  value={!!editPerms[key]}
                  onValueChange={v => setEditPerms(prev => ({...prev, [key]: v}))}
                  trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
                  thumbColor={editPerms[key] ? '#2563EB' : '#9CA3AF'}
                />
              </Box>
            ))}

            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s20" mt="s4">
              <Text preset="paragraphMedium" color="text">Activo</Text>
              <Switch
                value={!!editPerms.isActive}
                onValueChange={v => setEditPerms(prev => ({...prev, isActive: v}))}
                trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
                thumbColor={editPerms.isActive ? '#2563EB' : '#9CA3AF'}
              />
            </Box>

            <TouchableOpacityBox
              backgroundColor="secondary"
              paddingVertical="s16" borderRadius="s12" alignItems="center"
              onPress={handleUpdate}
              disabled={editLoading}
              style={{opacity: editLoading ? 0.5 : 1}}>
              {editLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text preset="paragraphMedium" color="surface" bold>Guardar</Text>
              )}
            </TouchableOpacityBox>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
