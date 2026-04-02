import React from 'react';
import {ScrollView, Dimensions, ActivityIndicator, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {LineChart} from 'react-native-chart-kit';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useCaptainAnalytics, AnalyticsPeriod} from '@domain';
import {formatBRL} from '@utils';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PERIOD_OPTIONS: {label: string; value: AnalyticsPeriod}[] = [
  {label: '7 dias', value: '7d'},
  {label: '30 dias', value: '30d'},
  {label: '90 dias', value: '90d'},
];

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  chartConfig: {
    borderRadius: 12,
  },
  chartWrapper: {
    borderRadius: 12,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  elevated: {
    elevation: 2,
  },
  lightElevation: {
    elevation: 1,
  },
  sectionCard: {
    elevation: 2,
  },
});

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <Box
      flex={1}
      backgroundColor="surface"
      borderRadius="s12"
      padding="s16"
      alignItems="center"
      style={styles.elevated}>
      <Icon name={icon as any} size={24} color={color as any} />
      <Text preset="headingSmall" bold mt="s8" color={color as any}>
        {value}
      </Text>
      <Text preset="paragraphCaptionSmall" color="textSecondary" textAlign="center" mt="s4">
        {label}
      </Text>
    </Box>
  );
}

export function CaptainAnalyticsScreen() {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation();
  const {summary, revenue, routes, passengers, isLoading, period, setPeriod} =
    useCaptainAnalytics();
  const headerStyle = [styles.header, {paddingTop: top + 16}];

  const chartLabels = revenue.map(d => {
    const date = new Date(d.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  const chartData = revenue.map(d => d.amount);

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="secondary"
        flexDirection="row"
        gap="s12"
        style={headerStyle}>
        <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s12">
          <Icon name="arrow-back" size={24} color="surface" />
        </TouchableOpacityBox>
        <Box>
          <Text preset="headingMedium" bold color="surface">
          Analytics
          </Text>
          <Text
            preset="paragraphSmall"
            mt="s4"
            style={styles.headerSubtitle}>
          Desempenho das suas operações
          </Text>
        </Box>
      </Box>

      {isLoading ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#0B5D8A" />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Summary Cards */}
          {summary && (
            <>
              <Box flexDirection="row" gap="s12" mb="s12">
                <StatCard
                  label="Receita total"
                  value={formatBRL(summary.totalRevenue)}
                  icon="attach-money"
                  color="#10B981"
                />
                <StatCard
                  label="Viagens concluídas"
                  value={String(summary.completedTrips)}
                  icon="directions-boat"
                  color="#0B5D8A"
                />
              </Box>
              <Box flexDirection="row" gap="s12" mb="s24">
                <StatCard
                  label="Passageiros"
                  value={String(summary.totalPassengers)}
                  icon="people"
                  color="#8B5CF6"
                />
                <StatCard
                  label="Avaliação média"
                  value={summary.avgRating > 0 ? summary.avgRating.toFixed(1) : '-'}
                  icon="star"
                  color="#F59E0B"
                />
              </Box>
            </>
          )}

          {/* Period selector */}
          <Box
            flexDirection="row"
            backgroundColor="surface"
            borderRadius="s12"
            padding="s4"
            mb="s16"
            style={styles.lightElevation}>
            {PERIOD_OPTIONS.map(opt => (
              <TouchableOpacityBox
                key={opt.value}
                flex={1}
                paddingVertical="s8"
                borderRadius="s8"
                alignItems="center"
                backgroundColor={period === opt.value ? 'secondary' : undefined}
                onPress={() => setPeriod(opt.value)}>
                <Text
                  preset="paragraphSmall"
                  bold
                  color={period === opt.value ? 'surface' : 'textSecondary'}>
                  {opt.label}
                </Text>
              </TouchableOpacityBox>
            ))}
          </Box>

          {/* Revenue Chart */}
          {chartData.length > 0 && (
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Receita por dia
              </Text>
              <Box
                backgroundColor="surface"
                borderRadius="s12"
                overflow="hidden"
                style={styles.sectionCard}>
                <LineChart
                  data={{
                    labels: chartLabels.length > 7 ? chartLabels.filter((_, i) => i % Math.ceil(chartLabels.length / 7) === 0) : chartLabels,
                    datasets: [{data: chartData.length > 0 ? chartData : [0]}],
                  }}
                  width={SCREEN_WIDTH - 32}
                  height={180}
                  yAxisLabel="R$"
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 0,
                    color: () => '#0B5D8A',
                    labelColor: () => '#6B7280',
                    style: styles.chartConfig,
                    propsForDots: {r: '4', strokeWidth: '2', stroke: '#0B5D8A'},
                  }}
                  bezier
                  style={styles.chartWrapper}
                  withInnerLines={false}
                />
              </Box>
            </Box>
          )}

          {/* Top Routes */}
          {routes.length > 0 && (
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Rotas mais lucrativas
              </Text>
              <Box
                backgroundColor="surface"
                borderRadius="s12"
                overflow="hidden"
                style={styles.sectionCard}>
                {routes.slice(0, 5).map((route, idx) => (
                  <Box
                    key={idx}
                    flexDirection="row"
                    alignItems="center"
                    padding="s16"
                    borderBottomWidth={idx < routes.length - 1 ? 1 : 0}
                    borderBottomColor="border">
                    <Box
                      width={28}
                      height={28}
                      borderRadius="s16"
                      backgroundColor="secondaryBg"
                      alignItems="center"
                      justifyContent="center"
                      mr="s12">
                      <Text preset="paragraphCaptionSmall" color="secondary" bold>
                        {idx + 1}
                      </Text>
                    </Box>
                    <Box flex={1}>
                      <Text preset="paragraphSmall" color="text" bold>
                        {route.origin} → {route.destination}
                      </Text>
                      <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                        {route.totalTrips} viagens · {Math.round(route.avgOccupancy)}% ocupação
                      </Text>
                    </Box>
                    <Text preset="paragraphSmall" color="success" bold>
                      {formatBRL(route.totalRevenue)}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Loyal Passengers */}
          {passengers.length > 0 && (
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Passageiros fiéis
              </Text>
              <Box
                backgroundColor="surface"
                borderRadius="s12"
                overflow="hidden"
                style={styles.sectionCard}>
                {passengers.slice(0, 5).map((p, idx) => (
                  <Box
                    key={p.userId}
                    flexDirection="row"
                    alignItems="center"
                    padding="s16"
                    borderBottomWidth={idx < passengers.length - 1 ? 1 : 0}
                    borderBottomColor="border">
                    <Box
                      width={40}
                      height={40}
                      borderRadius="s20"
                      backgroundColor="primaryBg"
                      alignItems="center"
                      justifyContent="center"
                      mr="s12">
                      <Icon name="person" size={22} color="primary" />
                    </Box>
                    <Box flex={1}>
                      <Text preset="paragraphSmall" color="text" bold>
                        {p.name}
                      </Text>
                      <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                        {p.totalTrips} {p.totalTrips === 1 ? 'viagem' : 'viagens'}
                      </Text>
                    </Box>
                    <Text preset="paragraphSmall" color="secondary" bold>
                      {formatBRL(p.totalSpent)}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {!summary && !isLoading && (
            <Box alignItems="center" mt="s40">
              <Icon name="analytics" size={64} color="textSecondary" />
              <Text preset="paragraphMedium" color="textSecondary" mt="s16" textAlign="center">
                Nenhum dado disponível ainda.{'\n'}Complete viagens para ver suas métricas.
              </Text>
            </Box>
          )}
        </ScrollView>
      )}
    </Box>
  );
}
