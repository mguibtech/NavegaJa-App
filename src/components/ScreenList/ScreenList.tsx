import React from 'react';
import {
  FlatList,
  RefreshControl,
  ListRenderItem,
  FlatListProps,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, TouchableOpacityBox} from '../Box/Box';
import {Text} from '../Text/Text';
import {Icon} from '../Icon/Icon';

interface Tab {
  id: string;
  label: string;
}

interface ScreenListProps<T> extends Partial<FlatListProps<T>> {
  title: string;
  data: T[];
  renderItem: ListRenderItem<T>;
  isLoading?: boolean;
  error?: unknown;
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
  emptyDescription = 'Tente ajustar seus filtros ou recarregar a pagina.',
  SkeletonComponent,
  tabs,
  selectedTab,
  onTabChange,
  headerRight,
  footer,
  ...flatListProps
}: ScreenListProps<T>) {
  const {top} = useSafeAreaInsets();
  const headerStyle = [styles.header, {paddingTop: top + 16}];
  const errorMessage =
    typeof error === 'string'
      ? error
      : 'Erro de conexao. Exibindo dados em cache.';

  return (
    <Box flex={1} backgroundColor="background">
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="surface"
        style={headerStyle}>
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mb={tabs ? 's16' : undefined}>
          <Text preset="headingMedium" color="text" bold>
            {title}
          </Text>
          {headerRight}
        </Box>

        {tabs && (
          <Box flexDirection="row" gap="s12">
            {tabs.map(tab => (
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

      {Boolean(error) && (
        <Box
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="s16"
          paddingVertical="s12"
          style={styles.errorBanner}>
          <Icon name="wifi-off" size={16} color="warning" />
          <Text preset="paragraphSmall" color="text" ml="s8" flex={1}>
            {errorMessage}
          </Text>
          {onRefresh && (
            <TouchableOpacityBox onPress={onRefresh} pl="s12">
              <Text preset="paragraphSmall" color="primary" bold>
                Tentar
              </Text>
            </TouchableOpacityBox>
          )}
        </Box>
      )}

      <FlatList
        data={isLoading && data.length === 0 ? [] : data}
        renderItem={renderItem}
        keyExtractor={flatListProps.keyExtractor || ((item: any) => item.id)}
        contentContainerStyle={[
          styles.listContent,
          flatListProps.contentContainerStyle,
        ]}
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
                <Text textAlign="center" mt="s24">
                  Carregando...
                </Text>
              )}
            </Box>
          ) : (
            <Box alignItems="center" paddingVertical="s48">
              <Icon name={emptyIcon} size={64} color="border" />
              <Text
                preset="headingSmall"
                color="textSecondary"
                mt="s16"
                textAlign="center">
                {emptyTitle}
              </Text>
              <Text
                preset="paragraphMedium"
                color="textSecondary"
                mt="s8"
                textAlign="center">
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

const styles = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
});
