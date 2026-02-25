import React, {useEffect} from 'react';
import {FlatList, RefreshControl} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {usePopularRoutes, PopularRoute} from '@domain';

import {AppStackParamList} from '@routes';
import {formatBRL} from '@utils';

type Props = NativeStackScreenProps<AppStackParamList, 'PopularRoutes'>;

export function PopularRoutesScreen({navigation}: Props) {
  const {data, fetch, isLoading, error} = usePopularRoutes();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await fetch();
    } catch (err) {
      console.error('Error loading popular routes:', err);
    }
  }

  const onRefresh = async () => {
    await loadData();
  };

  const handleRoutePress = (route: PopularRoute) => {
    navigation.navigate('SearchResults', {
      origin: route.origin,
      destination: route.destination,
    });
  };

  const renderRoute = ({item}: {item: PopularRoute}) => {
    return (
      <TouchableOpacityBox
        mb="s16"
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        onPress={() => handleRoutePress(item)}
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        {/* Header with Route */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s16">
          <Box flex={1} flexDirection="row" alignItems="center">
            <Box
              width={52}
              height={52}
              borderRadius="s12"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              marginRight="s16">
              <Icon name="directions-boat" size={26} color="primary" />
            </Box>

            <Box flex={1} mr="s12">
              <Box flexDirection="row" alignItems="center" mb="s6">
                <Text preset="paragraphMedium" color="text" bold numberOfLines={1} flexShrink={1}>
                  {item.origin}
                </Text>
                <Box mx="s8" flexShrink={0}>
                  <Icon name="arrow-forward" size={16} color="primary" />
                </Box>
                <Text preset="paragraphMedium" color="text" bold numberOfLines={1} flexShrink={1}>
                  {item.destination}
                </Text>
              </Box>

              <Box flexDirection="row" alignItems="center">
                <Box
                  backgroundColor="successBg"
                  paddingHorizontal="s10"
                  paddingVertical="s4"
                  borderRadius="s8">
                  <Text preset="paragraphCaptionSmall" color="success" bold>
                    {item.tripsCount} {item.tripsCount === 1 ? 'viagem' : 'viagens'}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          <Icon name="chevron-right" size={24} color="textSecondary" />
        </Box>

        {/* Pricing Section */}
        <Box
          flexDirection="row"
          alignItems="center"
          gap="s16"
          paddingTop="s16"
          borderTopWidth={1}
          borderTopColor="border">
          <Box flex={1}>
            <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s6">
              A partir de
            </Text>
            <Text preset="headingMedium" color="primary" bold>
              {formatBRL(item.minPrice)}
            </Text>
          </Box>

          <Box
            width={1}
            height={40}
            backgroundColor="border"
          />

          <Box flex={1}>
            <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s6">
              Preço médio
            </Text>
            <Text preset="paragraphMedium" color="text" bold>
              {formatBRL(item.avgPrice)}
            </Text>
          </Box>
        </Box>
      </TouchableOpacityBox>
    );
  };

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingVertical="s16"
        flexDirection="row"
        alignItems="center"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Button
          title=""
          preset="outline"
          leftIcon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Text preset="headingSmall" color="text" bold ml="s12">
          Rotas Populares
        </Text>
      </Box>

      {/* Routes List */}
      <FlatList
        data={data?.routes || []}
        keyExtractor={(item, index) => `${item.origin}-${item.destination}-${index}`}
        renderItem={renderRoute}
        contentContainerStyle={{padding: 24}}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          data?.routes && data.routes.length > 0 ? (
            <Box mb="s16">
              <Text preset="paragraphMedium" color="textSecondary">
                {data.routes.length} rotas mais populares
              </Text>
            </Box>
          ) : null
        }
        ListEmptyComponent={
          <Box alignItems="center" paddingVertical="s48">
            <Icon name="directions-boat-filled" size={64} color="border" />
            <Text preset="headingSmall" color="textSecondary" mt="s16">
              {error
                ? 'Erro ao carregar rotas'
                : isLoading
                ? 'Carregando...'
                : 'Nenhuma rota popular encontrada'}
            </Text>
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              mt="s8"
              textAlign="center">
              {error
                ? 'Tente novamente mais tarde'
                : 'As rotas mais procuradas aparecerão aqui'}
            </Text>
          </Box>
        }
      />
    </Box>
  );
}
