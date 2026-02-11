import React, {useEffect} from 'react';
import {Dimensions, Pressable, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import {Box, Icon, Text} from '@components';
import {useAppTheme} from '@hooks/useAppTheme';
import {ToastConfig, ToastType} from '../../store/toast.store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOAST_WIDTH = SCREEN_WIDTH - 48;

interface ToastProps extends ToastConfig {
  onHide: (id: string) => void;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: 'check-circle' as const,
        backgroundColor: 'secondaryBg' as const,
        iconColor: 'success' as const,
        borderColor: 'success' as const,
      };
    case 'error':
      return {
        icon: 'error' as const,
        backgroundColor: 'dangerBg' as const,
        iconColor: 'danger' as const,
        borderColor: 'danger' as const,
      };
    case 'warning':
      return {
        icon: 'warning' as const,
        backgroundColor: 'accentBg' as const,
        iconColor: 'warning' as const,
        borderColor: 'warning' as const,
      };
    case 'info':
      return {
        icon: 'info' as const,
        backgroundColor: 'primaryBg' as const,
        iconColor: 'info' as const,
        borderColor: 'info' as const,
      };
  }
};

export function Toast({id, type, message, action, onHide}: ToastProps) {
  const {colors} = useAppTheme();
  const config = getToastConfig(type);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    translateY.value = withSpring(0, {damping: 15});
    opacity.value = withTiming(1, {duration: 300});
  }, []);

  const handleHide = () => {
    // Animate out
    translateY.value = withTiming(-100, {duration: 200});
    opacity.value = withTiming(0, {duration: 200}, () => {
      runOnJS(onHide)(id);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          width: TOAST_WIDTH,
        },
      ]}>
      <Box
        backgroundColor={config.backgroundColor}
        borderRadius="s12"
        padding="s16"
        flexDirection="row"
        alignItems="center"
        style={[
          styles.toast,
          {
            borderLeftWidth: 4,
            borderLeftColor: colors[config.borderColor],
          },
        ]}>
        {/* Icon */}
        <Icon name={config.icon} size={24} color={config.iconColor} />

        {/* Message */}
        <Box flex={1} marginHorizontal="s12">
          <Text preset="paragraphMedium" color="text">
            {message}
          </Text>
        </Box>

        {/* Action Button */}
        {action && (
          <Pressable onPress={action.onPress}>
            <Text preset="paragraphSmall" color={config.iconColor} bold>
              {action.label}
            </Text>
          </Pressable>
        )}

        {/* Close Button */}
        {!action && (
          <Pressable onPress={handleHide} hitSlop={8}>
            <Icon name="close" size={20} color="textSecondary" />
          </Pressable>
        )}
      </Box>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    zIndex: 9999,
  },
  toast: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});
