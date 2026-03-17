import React from 'react';
import { FlatList, RefreshControl, Modal, ScrollView, ImageBackground, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Button, Icon, Text, TextInput, TouchableOpacityBox, PromoBadge, TripListSkeleton } from '@components';
import { getTripShipmentPricePerKg, tripAcceptsShipments } from '@domain';

import { formatBRL } from '@utils';

import { useSearchResultsScreen } from './useSearchResultsScreen';

const FILTER_BOAT_TYPES = [
  { value: 'Lancha', label: 'Lancha' },
  { value: 'Barco regional', label: 'Barco regional' },
  { value: 'Barco de linha', label: 'Barco de linha' },
  { value: 'Canoa motorizada', label: 'Canoa' },
  { value: 'Ferry', label: 'Ferry' },
];

function calculateDuration(departure: string, arrival: string): string {
  try {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return '--';
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  } catch {
    return '--';
  }
}

function formatTime(dateString: string): string {
  try {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

export function SearchResultsScreen() {
  const { top } = useSafeAreaInsets();
  const {
    origin,
    destination,
    promotion,
    context,
    trips: sortedTrips,
    isLoading,
    error,
    sortBy,
    showFilters,
    setShowFilters,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    departureTime,
    setDepartureTime,
    minRating,
    setMinRating,
    boatType,
    setBoatType,
    onlyAvailable,
    setOnlyAvailable,
    onlyVerified,
    setOnlyVerified,
    hasActiveFilters,
    activeFiltersCount,
    sortOptions,
    dateLabel,
    tripCountLabel,
    loadTrips,
    handleApplyFilters,
    handleClearFilters,
    handleSort,
    handleTripPress,
    handleGoBack,
  } = useSearchResultsScreen();

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        style={{
          paddingTop: top + 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center" mb="s16">
          {/* Botão Voltar */}
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s12"
            backgroundColor="background"
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor="border"
            onPress={handleGoBack}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>

          <Box flex={1} ml="s12">
            <Box flexDirection="row" alignItems="center" flexShrink={1}>
              <Text preset="paragraphMedium" color="text" bold numberOfLines={1} flexShrink={1}>
                {origin || 'Qualquer origem'}
              </Text>
              <Box mx="s4">
                <Icon name="arrow-forward" size={14} color="primary" />
              </Box>
              <Text preset="paragraphMedium" color="text" bold numberOfLines={1} flexShrink={1}>
                {destination || 'Qualquer destino'}
              </Text>
            </Box>
            <Text preset="paragraphSmall" color="textSecondary" style={{ marginTop: 2 }}>
              {dateLabel}
            </Text>
          </Box>

          {/* Filtros */}
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s12"
            backgroundColor={hasActiveFilters ? 'primaryBg' : 'background'}
            borderWidth={1}
            borderColor={hasActiveFilters ? 'primary' : 'border'}
            alignItems="center"
            justifyContent="center"
            onPress={() => setShowFilters(true)}>
            <Icon name="filter-list" size={22} color={hasActiveFilters ? 'primary' : 'text'} />
            {hasActiveFilters && (
              <Box
                width={16}
                height={16}
                borderRadius="s8"
                backgroundColor="danger"
                alignItems="center"
                justifyContent="center"
                style={{ position: 'absolute', top: -4, right: -4 }}>
                <Text preset="paragraphCaptionSmall" color="surface" bold>
                  {String(activeFiltersCount)}
                </Text>
              </Box>
            )}
          </TouchableOpacityBox>
        </Box>

        {/* Tabs de Ordenação */}
        <Box flexDirection="row" gap="s8">
          {sortOptions.map(option => (
            <TouchableOpacityBox
              key={option.value}
              flex={1}
              paddingVertical="s10"
              borderRadius="s12"
              borderWidth={1}
              borderColor={sortBy === option.value ? 'primary' : 'border'}
              backgroundColor={sortBy === option.value ? 'primaryBg' : 'background'}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap="s4"
              onPress={() => handleSort(option.value)}>
              <Icon
                name={option.icon as any}
                size={14}
                color={sortBy === option.value ? 'primary' : 'textSecondary'}
              />
              <Text
                preset="paragraphCaptionSmall"
                color={sortBy === option.value ? 'primary' : 'textSecondary'}
                bold={sortBy === option.value}>
                {option.label}
              </Text>
            </TouchableOpacityBox>
          ))}
        </Box>
      </Box>

      {/* Promoção Banner */}
      {promotion && (
        <Box paddingHorizontal="s24" paddingTop="s20" paddingBottom="s8">
          <Box
            borderRadius="s20"
            overflow="hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}>
            <ImageBackground
              source={{ uri: promotion.imageUrl }}
              style={{ width: '100%', minHeight: 160 }}
              imageStyle={{ borderRadius: 20 }}
              resizeMode="cover">
              <Box
                flex={1}
                padding="s24"
                style={{
                  backgroundColor: promotion.backgroundColor?.startsWith('#')
                    ? `${promotion.backgroundColor}DD`
                    : promotion.backgroundColor || 'rgba(0, 0, 0, 0.4)',
                }}>
                <Box flexDirection="row" alignItems="center" mb="s12">
                  <Box
                    backgroundColor="surface"
                    paddingHorizontal="s12"
                    paddingVertical="s6"
                    borderRadius="s20"
                    flexDirection="row"
                    alignItems="center">
                    <Icon name="local-offer" size={14} color="danger" />
                    <Text preset="paragraphCaptionSmall" color="danger" bold ml="s4">
                      PROMOÇÃO ATIVA
                    </Text>
                  </Box>
                </Box>
                <Text preset="headingMedium" color="surface" bold mb="s8">
                  {promotion.title}
                </Text>
                <Text preset="paragraphMedium" color="surface" mb="s16">
                  {promotion.description}
                </Text>
              </Box>
            </ImageBackground>
          </Box>
        </Box>
      )}

      {/* Lista de Resultados */}
      {isLoading && sortedTrips.length === 0 ? (
        <Box padding="s24">
          <Box mb="s20">
            <Text preset="paragraphMedium" color="text" bold>
              Buscando viagens...
            </Text>
          </Box>
          <TripListSkeleton count={5} />
        </Box>
      ) : (
        <FlatList
          data={sortedTrips}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadTrips} />
          }
          ListHeaderComponent={
            <Box mb="s16" flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text preset="paragraphMedium" color="text" bold>
                {tripCountLabel}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacityBox onPress={handleClearFilters}>
                  <Text preset="paragraphSmall" color="danger" bold>
                    Limpar filtros
                  </Text>
                </TouchableOpacityBox>
              )}
            </Box>
          }
          renderItem={({ item }) => {
            const depTime = formatTime(item.departureAt);
            const arrTime = formatTime(item.estimatedArrivalAt);
            const duration = calculateDuration(item.departureAt, item.estimatedArrivalAt);

            const departureDate = new Date(item.departureAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
            });

            const arrivalDate = new Date(item.estimatedArrivalAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
            });

            const price = typeof item.price === 'number'
              ? item.price
              : parseFloat(String(item.price)) || 0;

            let hasDiscount = !!(item.discount && item.discount > 0);
            let basePrice = item.basePrice ? Number(item.basePrice) : price;
            let displayPrice = item.discountedPrice ? Number(item.discountedPrice) : price;

            if (promotion && !hasDiscount) {
              const promoText = `${promotion.title} ${promotion.description}`.toLowerCase();
              const percentMatch = promoText.match(/(\d+)%/);
              if (percentMatch) {
                const promoDiscount = parseInt(percentMatch[1], 10);
                basePrice = price;
                displayPrice = price * (1 - promoDiscount / 100);
                hasDiscount = true;
              }
            }

            const boatName = item.boat?.name || `Barco ${item.boatId.slice(0, 8)}`;
            const captainName = item.captain?.name || `Cap. ${item.captainId.slice(0, 8)}`;
            const captainRating = item.captain?.rating ? Number(item.captain.rating).toFixed(1) : '5.0';
            const captainTrips = item.captain?.totalTrips || 0;

            const isUrgent = item.availableSeats > 0 && item.availableSeats <= 5;
            const isFull = item.availableSeats === 0;

            return (
              <TouchableOpacityBox
                mb="s16"
                backgroundColor="surface"
                borderRadius="s16"
                overflow="hidden"
                onPress={() => handleTripPress(item)}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}>
                {/* Topo colorido com data + badge de urgência */}
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingHorizontal="s20"
                  paddingVertical="s12"
                  backgroundColor="primaryBg">
                  <Box flex={1} flexDirection="row" justifyContent='space-between' gap="s8">
                    <Box flexDirection="row" alignItems="center" gap="s4">
                      <Icon name="event" size={16} color="primary" />
                      <Text preset="paragraphSmall" color="primary" bold>
                        {departureDate}
                      </Text>
                    </Box>
                    <Box flexDirection="row" alignItems="center" gap="s4">
                      <Icon name="event" size={16} color="primary" />
                      <Text preset="paragraphSmall" color="primary" bold>
                        {arrivalDate}
                      </Text>
                    </Box>
                  </Box>
                  {isUrgent && (
                    <Box
                      backgroundColor="warning"
                      paddingHorizontal="s10"
                      paddingVertical="s4"
                      borderRadius="s8">
                      <Text preset="paragraphCaptionSmall" color="surface" bold>
                        {`Só ${item.availableSeats} vagas!`}
                      </Text>
                    </Box>
                  )}
                  {isFull && (
                    <Box
                      backgroundColor="danger"
                      paddingHorizontal="s10"
                      paddingVertical="s4"
                      borderRadius="s8">
                      <Text preset="paragraphCaptionSmall" color="surface" bold>
                        Esgotado
                      </Text>
                    </Box>
                  )}
                </Box>

                <Box padding="s20">
                  {/* Horários */}
                  <Box flexDirection="row" alignItems="center" mb="s16">
                    <Box flex={1}>
                      <Text preset="paragraphSmall" color="textSecondary" style={{ marginBottom: 2 }}>
                        Saída
                      </Text>
                      <Text preset="headingSmall" color="text" bold>
                        {depTime}
                      </Text>
                    </Box>

                    <Box alignItems="center" flex={1}>
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        backgroundColor="background"
                        paddingHorizontal="s10"
                        paddingVertical="s6"
                        borderRadius="s20">
                        <Box
                          width={6}
                          height={6}
                          style={{ borderRadius: 3 }}
                          backgroundColor="primary"
                        />
                        <Box flex={1} height={1} backgroundColor="primary" mx="s4" />
                        <Icon name="directions-boat" size={16} color="primary" />
                        <Box flex={1} height={1} backgroundColor="primary" mx="s4" />
                        <Box
                          width={6}
                          height={6}
                          style={{ borderRadius: 3 }}
                          backgroundColor="primary"
                        />
                      </Box>
                      <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                        {duration}
                      </Text>
                    </Box>

                    <Box flex={1} alignItems="flex-end">
                      <Text preset="paragraphSmall" color="textSecondary" style={{ marginBottom: 2 }}>
                        Chegada
                      </Text>
                      <Text preset="headingSmall" color="text" bold>
                        {arrTime}
                      </Text>
                    </Box>
                  </Box>

                  {/* Barco e Capitão */}
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor="background"
                    borderRadius="s12"
                    padding="s12"
                    mb="s16">
                    <Box
                      width={40}
                      height={40}
                      borderRadius="s20"
                      backgroundColor="secondaryBg"
                      alignItems="center"
                      justifyContent="center"
                      mr="s12">
                      <Icon name="directions-boat" size={20} color="secondary" />
                    </Box>
                    <Box flex={1}>
                      <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
                        {boatName}
                      </Text>
                      <Text preset="paragraphSmall" color="textSecondary" numberOfLines={1}>
                        {captainName}
                      </Text>
                    </Box>
                    <Box alignItems="flex-end">
                      <Box flexDirection="row" alignItems="center">
                        <Icon name="star" size={14} color="warning" />
                        <Text preset="paragraphSmall" color="text" bold ml="s4">
                          {captainRating}
                        </Text>
                      </Box>
                      <Text preset="paragraphCaptionSmall" color="textSecondary">
                        {`${captainTrips} viagens`}
                      </Text>
                    </Box>
                  </Box>

                  {/* Preço e disponibilidade + botão */}
                  <Box flexDirection="row" alignItems="center">
                    <Box flex={1}>
                      {hasDiscount && context !== 'shipment' && (
                        <Box flexDirection="row" alignItems="center" mb="s4" gap="s8">
                          <PromoBadge discount={item.discount!} size="small" />
                          <Text
                            preset="paragraphSmall"
                            color="textSecondary"
                            style={{ textDecorationLine: 'line-through' }}>
                            {formatBRL(basePrice)}
                          </Text>
                        </Box>
                      )}
                      <Box flexDirection="row" alignItems="baseline" gap="s4">
                        {context === 'shipment' && !tripAcceptsShipments(item) ? (
                          <Text preset="paragraphMedium" color="textSecondary">
                            Preço sob consulta
                          </Text>
                        ) : (
                          <>
                            <Text preset="headingMedium" color="primary" bold>
                              {context === 'shipment'
                                ? formatBRL(getTripShipmentPricePerKg(item) ?? 0)
                                : formatBRL(displayPrice)}
                            </Text>
                            <Text preset="paragraphSmall" color="textSecondary">
                              {context === 'shipment' ? '/kg' : '/pessoa'}
                            </Text>
                          </>
                        )}
                      </Box>
                      {!isFull && context !== 'shipment' && (
                        <Box flexDirection="row" alignItems="center" mt="s4" gap="s4">
                          <Icon
                            name="event-seat"
                            size={14}
                            color={isUrgent ? 'warning' : 'success'}
                          />
                          <Text
                            preset="paragraphCaptionSmall"
                            color={isUrgent ? 'warning' : 'success'}>
                            {`${item.availableSeats} disponíveis`}
                          </Text>
                        </Box>
                      )}
                    </Box>

                    <TouchableOpacityBox
                      backgroundColor={isFull ? 'border' : 'primary'}
                      paddingHorizontal="s16"
                      paddingVertical="s12"
                      borderRadius="s12"
                      alignItems="center"
                      justifyContent="center"
                      style={{ flexShrink: 0 }}
                      onPress={() => !isFull && handleTripPress(item)}>
                      <Text preset="paragraphSmall" color={isFull ? 'textSecondary' : 'surface'} bold>
                        {isFull ? 'Esgotado' : context === 'shipment' ? 'Enviar' : 'Reservar'}
                      </Text>
                    </TouchableOpacityBox>
                  </Box>
                </Box>
              </TouchableOpacityBox>
            );
          }}
          ListEmptyComponent={
            <Box alignItems="center" paddingVertical="s48">
              <Box
                width={80}
                height={80}
                style={{ borderRadius: 40 }}
                backgroundColor="background"
                alignItems="center"
                justifyContent="center"
                mb="s16">
                <Icon name={error ? 'wifi-off' : 'search-off'} size={40} color="textSecondary" />
              </Box>
              <Text preset="headingSmall" color="text" bold mb="s8">
                {error ? 'Não foi possível buscar' : 'Nenhuma viagem'}
              </Text>
              <Text preset="paragraphMedium" color="textSecondary" textAlign="center" mb="s24">
                {error
                  ? ((error as any)?.statusCode === 429
                    ? 'Muitas requisições. Aguarde um momento e tente novamente.'
                    : 'Erro de conexão. Verifique sua internet e tente novamente.')
                  : 'Não encontramos viagens para essa rota. Tente outra data ou destino.'}
              </Text>
              {error && (
                <Box mb="s12">
                  <Button
                    title="Tentar Novamente"
                    onPress={loadTrips}
                    leftIcon="refresh"
                  />
                </Box>
              )}
              <Button
                title="Voltar e editar busca"
                preset="outline"
                onPress={handleGoBack}
                leftIcon="arrow-back"
              />
            </Box>
          }
        />
      )}

      {/* Modal de Filtros */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}>
        <Box flex={1} justifyContent="flex-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Box
            backgroundColor="surface"
            borderTopLeftRadius="s20"
            borderTopRightRadius="s20"
            paddingBottom="s24"
            maxHeight="80%">
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="s24"
              paddingTop="s20"
              paddingBottom="s16"
              borderBottomWidth={1}
              borderBottomColor="border">
              <TouchableOpacityBox onPress={() => setShowFilters(false)}>
                <Text preset="paragraphMedium" color="textSecondary">
                  Fechar
                </Text>
              </TouchableOpacityBox>
              <Text preset="headingSmall" color="text" bold>
                Filtros
              </Text>
              <TouchableOpacityBox onPress={handleClearFilters}>
                <Text preset="paragraphMedium" color="danger" bold>
                  Limpar
                </Text>
              </TouchableOpacityBox>
            </Box>

            <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
              {/* Faixa de Preço */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  Faixa de Preço
                </Text>
                <Box flexDirection="row" gap="s12">
                  <Box flex={1}>
                    <TextInput
                      label="Mínimo"
                      placeholder="R$ 0"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                    />
                  </Box>
                  <Box flex={1}>
                    <TextInput
                      label="Máximo"
                      placeholder="R$ 1000"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Horário de Partida */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  Horário de Partida
                </Text>
                <Box flexDirection="row" gap="s8">
                  {[
                    { value: 'morning' as const, label: 'Manhã', sub: '6h-12h', icon: 'wb-sunny' },
                    { value: 'afternoon' as const, label: 'Tarde', sub: '12h-18h', icon: 'wb-twilight' },
                    { value: 'night' as const, label: 'Noite', sub: '18h-6h', icon: 'nightlight' },
                  ].map(opt => (
                    <TouchableOpacityBox
                      key={opt.value}
                      flex={1}
                      paddingVertical="s12"
                      paddingHorizontal="s8"
                      borderRadius="s12"
                      borderWidth={1}
                      borderColor={departureTime === opt.value ? 'primary' : 'border'}
                      backgroundColor={departureTime === opt.value ? 'primaryBg' : 'background'}
                      alignItems="center"
                      onPress={() =>
                        setDepartureTime(departureTime === opt.value ? undefined : opt.value)
                      }>
                      <Icon
                        name={opt.icon as any}
                        size={20}
                        color={departureTime === opt.value ? 'primary' : 'text'}
                      />
                      <Text
                        preset="paragraphSmall"
                        color={departureTime === opt.value ? 'primary' : 'text'}
                        bold={departureTime === opt.value}
                        mt="s4">
                        {opt.label}
                      </Text>
                      <Text preset="paragraphCaptionSmall" color="textSecondary" style={{ marginTop: 2 }}>
                        {opt.sub}
                      </Text>
                    </TouchableOpacityBox>
                  ))}
                </Box>
              </Box>

              {/* Avaliação Mínima */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  Avaliação Mínima
                </Text>
                <Box flexDirection="row" gap="s8">
                  {[3, 3.5, 4, 4.5, 5].map(rating => (
                    <TouchableOpacityBox
                      key={rating}
                      flex={1}
                      paddingVertical="s12"
                      borderRadius="s12"
                      borderWidth={1}
                      borderColor={minRating === rating ? 'primary' : 'border'}
                      backgroundColor={minRating === rating ? 'primaryBg' : 'background'}
                      alignItems="center"
                      onPress={() => setMinRating(minRating === rating ? undefined : rating)}>
                      <Icon name="star" size={18} color={minRating === rating ? 'warning' : 'border'} />
                      <Text
                        preset="paragraphSmall"
                        color={minRating === rating ? 'primary' : 'text'}
                        bold={minRating === rating}
                        mt="s4">
                        {`${rating}+`}
                      </Text>
                    </TouchableOpacityBox>
                  ))}
                </Box>
              </Box>

              {/* Tipo de Barco */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  Tipo de Barco
                </Text>
                <Box flexDirection="row" flexWrap="wrap" gap="s8">
                  {FILTER_BOAT_TYPES.map(bt => (
                    <TouchableOpacityBox
                      key={bt.value}
                      paddingHorizontal="s16"
                      paddingVertical="s10"
                      borderRadius="s20"
                      borderWidth={1}
                      borderColor={boatType === bt.value ? 'primary' : 'border'}
                      backgroundColor={boatType === bt.value ? 'primaryBg' : 'background'}
                      onPress={() => setBoatType(boatType === bt.value ? undefined : bt.value)}>
                      <Text
                        preset="paragraphSmall"
                        color={boatType === bt.value ? 'primary' : 'text'}
                        bold={boatType === bt.value}>
                        {bt.label}
                      </Text>
                    </TouchableOpacityBox>
                  ))}
                </Box>
              </Box>

              {/* Opções adicionais */}
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  Opções
                </Text>
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical="s14"
                  borderBottomWidth={1}
                  borderBottomColor="border">
                  <Box>
                    <Text preset="paragraphSmall" color="text" bold>
                      Somente com vagas
                    </Text>
                    <Text preset="paragraphCaptionSmall" color="textSecondary">
                      Ocultar viagens esgotadas
                    </Text>
                  </Box>
                  <Switch
                    value={onlyAvailable}
                    onValueChange={setOnlyAvailable}
                    trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                    thumbColor={onlyAvailable ? '#0B5D8A' : '#9CA3AF'}
                  />
                </Box>
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical="s14">
                  <Box>
                    <Text preset="paragraphSmall" color="text" bold>
                      Barco verificado
                    </Text>
                    <Text preset="paragraphCaptionSmall" color="textSecondary">
                      Apenas embarcações certificadas
                    </Text>
                  </Box>
                  <Switch
                    value={onlyVerified}
                    onValueChange={setOnlyVerified}
                    trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                    thumbColor={onlyVerified ? '#0B5D8A' : '#9CA3AF'}
                  />
                </Box>
              </Box>

              {hasActiveFilters && (
                <Box backgroundColor="primaryBg" padding="s16" borderRadius="s12" mb="s8">
                  <Text preset="paragraphMedium" color="primary" bold>
                    {`${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} ativo${activeFiltersCount > 1 ? 's' : ''}`}
                  </Text>
                </Box>
              )}
            </ScrollView>

            <Box paddingHorizontal="s24">
              <TouchableOpacityBox
                backgroundColor="primary"
                paddingVertical="s16"
                borderRadius="s12"
                alignItems="center"
                onPress={handleApplyFilters}>
                <Text preset="paragraphMedium" color="surface" bold>
                  Aplicar Filtros
                </Text>
              </TouchableOpacityBox>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
