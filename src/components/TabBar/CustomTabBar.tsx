import React, {useEffect, useRef} from 'react';
import {Animated, Platform, StyleSheet, TouchableOpacity} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Text} from '@components';
import {useTheme} from '@shopify/restyle';
import {Theme} from '@theme';

/**
 * TabBar customizada para Passageiros
 * Cor: Azul (primary)
 */
export function CustomTabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const {bottom} = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const containerStyle = React.useMemo(
    () => ({
      paddingBottom: bottom > 0 ? bottom : 10,
      paddingTop: 8,
      shadowColor: theme.colors.text,
    }),
    [bottom, theme.colors.text],
  );

  return (
    <Box
      backgroundColor="surface"
      style={[
        styles.container,
        containerStyle,
      ]}>
      <Box flexDirection="row" alignItems="flex-start" justifyContent="space-around">
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const badgeCount = options.tabBarBadge as number | undefined;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              label={label as string}
              badgeCount={badgeCount}
              options={options}
              onPress={onPress}
            />
          );
        })}
      </Box>
    </Box>
  );
}

interface TabItemProps {
  isFocused: boolean;
  label: string;
  badgeCount?: number;
  options: any;
  onPress: () => void;
}

function TabItem({isFocused, label, badgeCount, options, onPress}: TabItemProps) {
  const theme = useTheme<Theme>();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(translateYAnim, {
        toValue: isFocused ? -4 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(opacityAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const iconColor = isFocused ? 'surface' : 'textSecondary';
  const textColor = isFocused ? 'primary' : 'textSecondary';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.tabItem}>
      <Box alignItems="center">
        {/* Container do ícone */}
        <Box position="relative" mb="s6" style={styles.visibleOverflow}>
          <Animated.View
            style={[
              styles.iconContainer,
              styles.iconShadow,
              isFocused ? styles.iconShadowFocused : styles.iconShadowFlat,
              {
                transform: [{scale: scaleAnim}, {translateY: translateYAnim}],
                shadowColor: theme.colors.primary,
              },
            ]}>
            {/* Background com gradiente para item ativo */}
            <Animated.View
              style={[
                styles.activeBackground,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: opacityAnim,
                },
              ]}
            />

            {/* Ícone */}
            <Box zIndex={1}>
              {options.tabBarIcon?.({
                focused: isFocused,
                color: theme.colors[iconColor],
                size: 24,
              })}
            </Box>
          </Animated.View>

          {/* Badge de notificação */}
          {badgeCount !== undefined && badgeCount > 0 && (
            <Box style={styles.badge}>
              <Text style={styles.badgeText} color="surface">
                {badgeCount > 99 ? '99+' : `${badgeCount}`}
              </Text>
            </Box>
          )}
        </Box>

        {/* Label */}
        <Text
          style={[styles.label, isFocused ? styles.labelFocused : undefined]}
          color={textColor}
          numberOfLines={1}>
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 40,
    height: 40,
  },
  activeBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  visibleOverflow: {
    overflow: 'visible',
  },
  iconShadow: {
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 16,
  },
  iconShadowFocused: {
    shadowOpacity: 0.3,
    elevation: 8,
  },
  iconShadowFlat: {
    shadowOpacity: 0,
    elevation: 0,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  labelFocused: {
    fontWeight: '700',
  },
});
