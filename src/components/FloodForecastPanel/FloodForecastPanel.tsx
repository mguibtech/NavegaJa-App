import React, {useEffect} from 'react';

import {Box, Icon, Text} from '@components';
import {
  useFloodForecast,
  FloodStatus,
  FloodSeverity,
  FLOOD_SEVERITY_CONFIG,
  FLOOD_SEVERITY_ORDER,
  FLOOD_RISK_SEVERITIES,
  FLOOD_TREND_CONFIG,
} from '@domain';

interface FloodForecastPanelProps {
  lat: number;
  lng: number;
  radiusKm?: number;
}

function formatIssuedTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${d.getDate()}/${d.getMonth() + 1} às ${h}:${m}`;
  } catch {
    return '—';
  }
}

function StatusRow({status}: {status: FloodStatus}) {
  const sevCfg = FLOOD_SEVERITY_CONFIG[status.severity];
  const trendCfg = FLOOD_TREND_CONFIG[status.forecastTrend];

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s12"
      padding="s16"
      mb="s12"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: sevCfg.color,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}>
      {/* Rio + badge severity */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s8">
        <Box flex={1} mr="s8">
          <Text preset="paragraphSmall" color="text" bold numberOfLines={1}>
            {status.river ?? '—'}
          </Text>
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            Est. {status.siteName ?? status.gaugeId}
          </Text>
        </Box>
        <Box
          paddingHorizontal="s10"
          paddingVertical="s4"
          borderRadius="s8"
          style={{backgroundColor: sevCfg.bgColor}}>
          <Text preset="paragraphCaptionSmall" bold style={{color: sevCfg.color}}>
            {sevCfg.label}
          </Text>
        </Box>
      </Box>

      {/* Tendência + variação */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box flexDirection="row" alignItems="center">
          <Icon name={trendCfg.iconName as any} size={16} color={trendCfg.color as any} />
          <Text
            preset="paragraphCaptionSmall"
            ml="s4"
            style={{color: trendCfg.color}}>
            {trendCfg.label}
            {status.forecastChange > 0
              ? ` +${status.forecastChange.toFixed(2)} m`
              : status.forecastChange < 0
              ? ` ${status.forecastChange.toFixed(2)} m`
              : ''}
          </Text>
        </Box>
        <Text preset="paragraphCaptionSmall" color="textSecondary">
          {formatIssuedTime(status.issuedTime)}
        </Text>
      </Box>
    </Box>
  );
}

export function FloodForecastPanel({lat, lng, radiusKm = 50}: FloodForecastPanelProps) {
  const {data, isLoading, fetch} = useFloodForecast();

  useEffect(() => {
    fetch(lat, lng, radiusKm).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  if (isLoading) {
    return (
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        style={{elevation: 3}}>
        <Box flexDirection="row" alignItems="center" mb="s16">
          <Icon name="flood" size={20} color="primary" />
          <Text preset="paragraphMedium" color="text" bold ml="s8">
            Previsão de Cheias
          </Text>
        </Box>
        {[0, 1].map(i => (
          <Box
            key={i}
            backgroundColor="border"
            borderRadius="s12"
            height={80}
            mb="s12"
            style={{opacity: 0.5}}
          />
        ))}
      </Box>
    );
  }

  // Filtrar apenas estações com risco real (excluir NO_FLOODING da lista)
  const alertStatuses = (data?.statuses ?? [])
    .filter(s => FLOOD_RISK_SEVERITIES.includes(s.severity as FloodSeverity))
    .sort((a, b) => FLOOD_SEVERITY_ORDER[a.severity] - FLOOD_SEVERITY_ORDER[b.severity]);

  const isMock = data?.source === 'mock';

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Header */}
      <Box flexDirection="row" alignItems="center" mb="s4">
        <Icon name="flood" size={20} color="primary" />
        <Text preset="paragraphMedium" color="text" bold ml="s8" flex={1}>
          Previsão de Cheias
        </Text>
        <Box
          paddingHorizontal="s8"
          paddingVertical="s4"
          borderRadius="s8"
          style={{backgroundColor: '#EFF6FF'}}>
          <Text preset="paragraphCaptionSmall" bold style={{color: '#1D4ED8'}}>
            Flood Hub
          </Text>
        </Box>
      </Box>

      {/* Badge: mock vs real */}
      {isMock ? (
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="border"
          borderRadius="s8"
          padding="s8"
          mb="s16"
          mt="s4">
          <Icon name="science" size={14} color="textSecondary" />
          <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s6">
            Dados estimados — API Flood Hub pendente de aprovação
          </Text>
        </Box>
      ) : (
        <Box mb="s12" mt="s4">
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            Atualizado: {data?.lastUpdated ? formatIssuedTime(data.lastUpdated) : '—'}
          </Text>
        </Box>
      )}

      {/* Lista de alertas */}
      {alertStatuses.length === 0 ? (
        <Box alignItems="center" paddingVertical="s16">
          <Icon name="check-circle" size={32} color={'#16A34A' as any} />
          <Text preset="paragraphSmall" color="textSecondary" mt="s8" textAlign="center">
            Nenhum alerta de cheia ativo na região
          </Text>
        </Box>
      ) : (
        <>
          {alertStatuses.map(s => (
            <StatusRow key={s.gaugeId} status={s} />
          ))}
        </>
      )}

      {/* Rodapé */}
      {data && (
        <Box flexDirection="row" alignItems="center" mt="s8">
          <Icon name="sensors" size={14} color="textSecondary" />
          <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s6">
            {data.gauges.length} estações monitoradas na região
          </Text>
        </Box>
      )}
    </Box>
  );
}
