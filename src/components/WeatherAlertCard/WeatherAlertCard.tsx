import React from 'react';

import {Box, Icon, Text} from '@components';
import {WeatherAlert, AlertSeverity} from '@domain';

interface WeatherAlertCardProps {
  alert: WeatherAlert;
  compact?: boolean;
}

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {bg: string; borderColor: string; color: string; icon: string; label: string}
> = {
  [AlertSeverity.INFO]:    {bg: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8', icon: 'info',      label: 'Informativo'},
  [AlertSeverity.WARNING]: {bg: '#FEF9C3', borderColor: '#FDE68A', color: '#B45309', icon: 'warning',   label: 'Atenção'},
  [AlertSeverity.SEVERE]:  {bg: '#FFEDD5', borderColor: '#FED7AA', color: '#C2410C', icon: 'error',     label: 'Severo'},
  [AlertSeverity.EXTREME]: {bg: '#FEE2E2', borderColor: '#FECACA', color: '#DC2626', icon: 'dangerous', label: 'Extremo'},
};

export function WeatherAlertCard({alert, compact = false}: WeatherAlertCardProps) {
  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG[AlertSeverity.WARNING];

  if (compact) {
    return (
      <Box
        flexDirection="row"
        alignItems="center"
        padding="s12"
        borderRadius="s12"
        style={{
          backgroundColor: cfg.bg,
          borderLeftWidth: 3,
          borderLeftColor: cfg.borderColor,
        }}>
        <Icon name={cfg.icon as any} size={18} color={cfg.color as any} />
        <Box flex={1} ml="s10">
          <Text preset="paragraphCaptionSmall" bold style={{color: cfg.color}}>
            {alert.event}
          </Text>
          <Text
            preset="paragraphCaptionSmall"
            style={{color: cfg.color}}
            numberOfLines={2}>
            {alert.headline}
          </Text>
        </Box>
      </Box>
    );
  }

  const startStr = new Date(alert.start).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const endStr = new Date(alert.end).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box
      padding="s16"
      borderRadius="s16"
      mb="s12"
      style={{
        backgroundColor: cfg.bg,
        borderLeftWidth: 4,
        borderLeftColor: cfg.borderColor,
      }}>
      {/* Header: ícone + evento + badge de severidade */}
      <Box flexDirection="row" alignItems="center" mb="s8">
        <Icon name={cfg.icon as any} size={20} color={cfg.color as any} />
        <Text
          preset="paragraphSmall"
          bold
          style={{color: cfg.color}}
          ml="s8"
          flex={1}>
          {alert.event}
        </Text>
        <Box
          paddingHorizontal="s8"
          paddingVertical="s4"
          borderRadius="s8"
          style={{backgroundColor: cfg.borderColor}}>
          <Text preset="paragraphCaptionSmall" bold style={{color: cfg.color}}>
            {cfg.label}
          </Text>
        </Box>
      </Box>

      {/* Título do alerta */}
      <Text preset="paragraphSmall" bold style={{color: cfg.color}} mb="s4">
        {alert.headline}
      </Text>

      {/* Descrição (truncada em 4 linhas) */}
      {!!alert.description && (
        <Text
          preset="paragraphCaptionSmall"
          style={{color: cfg.color}}
          mb="s8"
          numberOfLines={4}>
          {alert.description}
        </Text>
      )}

      {/* Período de vigência */}
      <Box flexDirection="row" alignItems="center">
        <Icon name="schedule" size={12} color={cfg.color as any} />
        <Text
          preset="paragraphCaptionSmall"
          style={{color: cfg.color}}
          ml="s4">
          {startStr} → {endStr}
        </Text>
      </Box>
    </Box>
  );
}
