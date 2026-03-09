import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, ScreenHeader, SearchableLocationInput} from '@components';
import {Boat} from '@domain';

import {
  useCaptainCreateTrip,
  formatMoney,
  onMoneyChange,
} from './useCaptainCreateTrip';

export function CaptainCreateTripScreen() {
  const {
    canCreateTrips,
    isPending,
    isBoatManager,
    boats,
    isBoatsLoading,
    isLoading,
    selectedBoat,
    selectedBoatId,
    origin,
    destination,
    selectOrigin,
    selectDestination,
    departureDate,
    arrivalDate,
    showDatePicker,
    showTimePicker,
    tempDate,
    price,
    setPrice,
    cargoPriceKg,
    setCargoPriceKg,
    totalSeats,
    setTotalSeats,
    showBoatPicker,
    setShowBoatPicker,
    setSelectedBoatId,
    formatDateTime,
    openDatePicker,
    onDateChange,
    onTimeChange,
    handleSubmit,
    goBack,
    navigateToCreateBoat,
    navigateToEditProfile,
  } = useCaptainCreateTrip();

  // Guard: bloqueia se capabilities existem e canCreateTrips=false
  if (!canCreateTrips) {
    return (
      <Box flex={1} backgroundColor="background">
        <ScreenHeader title="Nova Viagem" onBack={goBack} />
        <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s32">
          <Box
            width={80} height={80} borderRadius="s48"
            backgroundColor={isPending ? 'infoBg' : 'warningBg'}
            alignItems="center" justifyContent="center" mb="s24">
            <Icon name={isPending ? 'hourglass-top' : 'lock'} size={40} color={isPending ? 'info' : 'warning'} />
          </Box>
          <Text preset="headingSmall" color="text" bold mb="s12" style={{textAlign: 'center'}}>
            {isPending ? 'Conta em análise' : 'Conta pendente de verificação'}
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" style={{textAlign: 'center'}}>
            {isPending
              ? 'Seus documentos estão sendo analisados. Em breve você poderá criar viagens.'
              : 'Envie sua habilitação náutica para começar a criar viagens.'}
          </Text>
          {!isPending && (
            <Button
              title="Enviar documentos"
              onPress={navigateToEditProfile}
              style={{marginTop: 32}}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box flex={1} backgroundColor="background">
          <ScreenHeader title="Nova Viagem" onBack={goBack} />

          <ScrollView
            contentContainerStyle={{padding: 20, paddingBottom: 120}}
            keyboardShouldPersistTaps="handled">
            {/* Rota */}
            <Text preset="paragraphMedium" color="text" bold mb="s12">
              Rota
            </Text>

            {/* Origem */}
            <Box mb="s12">
              <SearchableLocationInput
                value={origin}
                onSelect={selectOrigin}
                placeholder="Buscar origem (cidade ou comunidade)"
                iconName="place"
                label="Origem"
              />
            </Box>

            {/* Destino */}
            <Box mb="s24">
              <SearchableLocationInput
                value={destination}
                onSelect={selectDestination}
                placeholder="Buscar destino (cidade ou comunidade)"
                iconName="flag"
                label="Destino"
              />
            </Box>

            {/* Data e Hora */}
            <Text preset="paragraphMedium" color="text" bold mb="s12">
              Data e Horário
            </Text>

            <TouchableOpacityBox
              backgroundColor="surface"
              borderRadius="s12"
              borderWidth={1}
              borderColor={departureDate ? 'secondary' : 'border'}
              padding="s16"
              flexDirection="row"
              alignItems="center"
              mb="s12"
              onPress={() => openDatePicker('departure')}>
              <Icon name="flight-takeoff" size={20} color="textSecondary" />
              <Text
                preset="paragraphMedium"
                color={departureDate ? 'text' : 'textSecondary'}
                ml="s12"
                flex={1}>
                {departureDate
                  ? formatDateTime(departureDate)
                  : 'Selecionar data/hora de partida'}
              </Text>
              <Icon name="event" size={20} color="textSecondary" />
            </TouchableOpacityBox>

            <TouchableOpacityBox
              backgroundColor="surface"
              borderRadius="s12"
              borderWidth={1}
              borderColor={arrivalDate ? 'secondary' : 'border'}
              padding="s16"
              flexDirection="row"
              alignItems="center"
              mb="s24"
              onPress={() => openDatePicker('arrival')}>
              <Icon name="flight-land" size={20} color="textSecondary" />
              <Text
                preset="paragraphMedium"
                color={arrivalDate ? 'text' : 'textSecondary'}
                ml="s12"
                flex={1}>
                {arrivalDate
                  ? formatDateTime(arrivalDate)
                  : 'Selecionar chegada prevista'}
              </Text>
              <Icon name="event" size={20} color="textSecondary" />
            </TouchableOpacityBox>

            {/* Preço e Assentos */}
            <Text preset="paragraphMedium" color="text" bold mb="s12">
              Preço e Capacidade
            </Text>
            <Box mb="s12">
              <TextInput
                placeholder="Preço por passageiro (ex: 85,00)"
                value={formatMoney(price)}
                onChangeText={t => onMoneyChange(t, setPrice)}
                keyboardType="numeric"
                leftIcon="attach-money"
              />
            </Box>
            <Box mb={selectedBoat ? 's4' : 's12'}>
              <TextInput
                placeholder={
                  selectedBoat
                    ? `Número de assentos (máx. ${selectedBoat.capacity})`
                    : 'Número de assentos'
                }
                value={totalSeats}
                onChangeText={v => setTotalSeats(v.replace(/\D/g, ''))}
                keyboardType="numeric"
                leftIcon="event-seat"
              />
            </Box>
            {selectedBoat && (
              <Box flexDirection="row" alignItems="center" mb="s12" ml="s4">
                <Icon name="event-seat" size={14} color="textSecondary" />
                <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
                  Capacidade da embarcação: {selectedBoat.capacity} lugares
                </Text>
              </Box>
            )}
            <Box mb="s24">
              <TextInput
                placeholder="Frete por kg (ex: 2,50) — opcional"
                value={formatMoney(cargoPriceKg)}
                onChangeText={t => onMoneyChange(t, setCargoPriceKg)}
                keyboardType="numeric"
                leftIcon="inventory"
              />
            </Box>

            {/* Embarcação */}
            <Text preset="paragraphMedium" color="text" bold mb="s12">
              Embarcação
            </Text>

            {isBoatsLoading ? (
              <Box
                backgroundColor="surface"
                padding="s16"
                borderRadius="s12"
                mb="s24"
                flexDirection="row"
                alignItems="center">
                <ActivityIndicator size="small" color="#0a6fbd" />
                <Text preset="paragraphSmall" color="textSecondary" ml="s12">
                  A carregar embarcações…
                </Text>
              </Box>
            ) : boats.length === 0 ? (
              <Box
                backgroundColor="warningBg"
                padding="s16"
                borderRadius="s12"
                mb="s24"
                flexDirection="row"
                alignItems="center">
                <Icon name="warning" size={20} color="warning" />
                <Box flex={1} ml="s12">
                  {isBoatManager ? (
                    <Text preset="paragraphSmall" color="warning">
                      Nenhuma embarcação atribuída. Contacte o capitão responsável.
                    </Text>
                  ) : (
                    <>
                      <Text preset="paragraphSmall" color="warning">
                        Nenhuma embarcação cadastrada.
                      </Text>
                      <TouchableOpacityBox
                        mt="s8"
                        onPress={navigateToCreateBoat}>
                        <Text preset="paragraphSmall" color="secondary" bold>
                          Cadastrar embarcação →
                        </Text>
                      </TouchableOpacityBox>
                    </>
                  )}
                </Box>
              </Box>
            ) : (
              <Box mb="s24">
                <TouchableOpacityBox
                  backgroundColor="surface"
                  borderRadius="s12"
                  padding="s16"
                  borderWidth={1}
                  borderColor={selectedBoatId ? 'secondary' : 'border'}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onPress={() => setShowBoatPicker(!showBoatPicker)}>
                  <Box flexDirection="row" alignItems="center" flex={1}>
                    <Icon name="sailing" size={20} color="secondary" />
                    <Box ml="s12" flex={1}>
                      <Text
                        preset="paragraphMedium"
                        color={selectedBoatId ? 'text' : 'textSecondary'}>
                        {selectedBoat
                          ? selectedBoat.name
                          : 'Selecione uma embarcação'}
                      </Text>
                      {selectedBoat && (
                        <Text preset="paragraphCaptionSmall" color="textSecondary">
                          Máx. {selectedBoat.capacity} assentos
                        </Text>
                      )}
                    </Box>
                  </Box>
                  <Icon
                    name={showBoatPicker ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="textSecondary"
                  />
                </TouchableOpacityBox>

                {showBoatPicker && (
                  <Box
                    backgroundColor="surface"
                    borderRadius="s12"
                    borderWidth={1}
                    borderColor="border"
                    mt="s8"
                    overflow="hidden">
                    {boats.map((boat: Boat, idx: number) => {
                      const isUnverified = !boat.isVerified;
                      const isSelected = selectedBoatId === boat.id;
                      return (
                        <TouchableOpacityBox
                          key={boat.id}
                          padding="s16"
                          flexDirection="row"
                          alignItems="center"
                          backgroundColor={isSelected ? 'secondaryBg' : 'surface'}
                          borderTopWidth={idx > 0 ? 1 : 0}
                          borderTopColor="border"
                          style={{opacity: isUnverified ? 0.5 : 1}}
                          onPress={() => {
                            if (isUnverified) {return;}
                            setSelectedBoatId(boat.id);
                            setShowBoatPicker(false);
                          }}>
                          <Icon
                            name={isSelected ? 'check-circle' : 'sailing'}
                            size={20}
                            color={isSelected ? 'secondary' : 'textSecondary'}
                          />
                          <Box flex={1} ml="s12">
                            <Text preset="paragraphMedium" color="text" bold>
                              {boat.name}
                            </Text>
                            <Text preset="paragraphSmall" color="textSecondary">
                              {boat.type}
                              {boat.registrationNum ? ` · ${boat.registrationNum}` : ''}
                            </Text>
                          </Box>
                          <Box
                            paddingHorizontal="s8"
                            paddingVertical="s4"
                            borderRadius="s8"
                            backgroundColor={isSelected ? 'secondaryBg' : 'background'}
                            flexDirection="row"
                            alignItems="center"
                            mr={isUnverified ? 's8' : undefined}>
                            <Icon name="event-seat" size={12} color={isSelected ? 'secondary' : 'textSecondary'} />
                            <Text
                              preset="paragraphCaptionSmall"
                              color={isSelected ? 'secondary' : 'textSecondary'}
                              bold
                              ml="s4">
                              {boat.capacity}
                            </Text>
                          </Box>
                          {isUnverified && (
                            <Box
                              paddingHorizontal="s8"
                              paddingVertical="s4"
                              borderRadius="s8"
                              style={{backgroundColor: '#FEF3C7'}}>
                              <Text
                                preset="paragraphCaptionSmall"
                                bold
                                style={{color: '#92400E'}}>
                                Em análise
                              </Text>
                            </Box>
                          )}
                        </TouchableOpacityBox>
                      );
                    })}
                  </Box>
                )}

                {/* Aviso quando nenhuma embarcação está verificada */}
                {boats.every((b: Boat) => !b.isVerified) && (
                  <Box
                    backgroundColor="warningBg"
                    padding="s12"
                    borderRadius="s8"
                    mt="s8"
                    flexDirection="row"
                    alignItems="center">
                    <Icon name="hourglass-top" size={16} color="warning" />
                    <Text preset="paragraphSmall" color="warning" ml="s8" flex={1}>
                      Suas embarcações estão em análise. Aguarde a verificação para criar viagens.
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            <Button
              title={isLoading ? 'Criando...' : 'Criar Viagem'}
              onPress={handleSubmit}
              disabled={isLoading}
            />
            {isLoading && (
              <Box alignItems="center" mt="s16">
                <ActivityIndicator size="small" color="#0a6fbd" />
              </Box>
            )}
          </ScrollView>
        </Box>

        {/* Date Picker Dialog */}
        {showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {/* Time Picker Dialog (sequential after date) */}
        {showTimePicker && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            display="default"
            is24Hour
            onChange={onTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
}
