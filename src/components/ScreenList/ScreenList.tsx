import React from 'react';
import {FlatList, RefreshControl, ListRenderItem, FlatListProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box} from '../Box/Box';
import {Text} from '../Text/Text';
import {Icon} from '../Icon/Icon';
import {TouchableOpacityBox} from '../Box/Box';

interface Tab {
  id: string;
  label: string;
}

interface ScreenListProps<T> extends Partial<FlatListProps<T>> {
  title: string;
  data: T[];
  renderItem: ListRenderItem<T>;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  SkeletonComponent?: React.ComponentType;
  tabs?: Tab[];
  selectedTab?: string;
  onTabChange?: (tabId: string) => void;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ScreenList<T>({
  title,
  data,
  renderItem,
  isLoading,
  error,
  onRefresh,
  refreshing = false,
  emptyIcon = 'search_off',
  emptyTitle = 'Nenhum item encontrado',
  emptyDescription = 'Tente ajustar seus filtros ou recarregar a página.',
  SkeletonComponent,
  tabs,
  selectedTab,
  onTabChange,
  headerRight,
  footer,
  ...flatListProps
}: ScreenListProps<T>) {
  const {top} = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="surface"
        style={{
          paddingTop: top + 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb={tabs ? "s16" : "s0"}>
          <Text preset="headingMedium" color="text" bold>
            {title}
          </Text>
          {headerRight}
        </Box>

        {tabs && (
          <Box flexDirection="row" gap="s12">
            {tabs.map((tab) => (
              <TouchableOpacityBox
                key={tab.id}
                flex={1}
                paddingVertical="s12"
                borderRadius="s12"
                backgroundColor={selectedTab === tab.id ? 'primary' : 'background'}
                alignItems="center"
                onPress={() => onTabChange?.(tab.id)}>
                <Text
                  preset="paragraphMedium"
                  color={selectedTab === tab.id ? 'surface' : 'text'}
                  bold>
                  {tab.label}
                </Text>
              </TouchableOpacityBox>
            ))}
          </Box>
        )}
      </Box>

      {error && (
        <Box
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="s16"
          paddingVertical="s12"
          style={{backgroundColor: '#FEF3C7', borderBottomWidth: 1, borderBottomColor: '#FDE68A'}}>
          <Icon name="wifi-off" size={16} color="warning" />
          <Text preset="paragraphSmall" color="text" ml="s8" flex={1}>
            {typeof error === 'string' ? error : 'Erro de conexão. Exibindo dados em cache.'}
          </Text>
          {onRefresh && (
            <TouchableOpacityBox onPress={onRefresh} pl="s12">
              <Text preset="paragraphSmall" color="primary" bold>Tentar</Text>
            </TouchableOpacityBox>
          )}
        </Box>
      )}

      <FlatList
        data={isLoading && data.length === 0 ? [] : data}
        renderItem={renderItem}
        keyExtractor={flatListProps.keyExtractor || ((item: any) => item.id)}
        contentContainerStyle={[{padding: 24, paddingBottom: 100}, flatListProps.contentContainerStyle]}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        ListEmptyComponent={
          isLoading ? (
            <Box>
              {SkeletonComponent ? (
                <>
                  <SkeletonComponent />
                  <SkeletonComponent />
                  <SkeletonComponent />
                </>
              ) : (
                <Text textAlign="center" mt="s24">Carregando...</Text>
              )}
            </Box>
          ) : (
            <Box alignItems="center" paddingVertical="s48">
              <Icon name={emptyIcon} size={64} color="border" />
              <Text preset="headingSmall" color="textSecondary" mt="s16" textAlign="center">
                {emptyTitle}
              </Text>
              <Text preset="paragraphMedium" color="textSecondary" mt="s8" textAlign="center">
                {emptyDescription}
              </Text>
            </Box>
          )
        }
        {...flatListProps}
      />
      {footer}
    </Box>
  );
}
