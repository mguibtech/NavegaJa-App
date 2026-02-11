import React, {useEffect} from 'react';
import {Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

import {Box, AnimatedSplashLogo} from '@components';

interface SplashScreenProps {
  onFinish: () => void;
}

const {width} = Dimensions.get('window');
const logoSize = Math.min(width * 0.8, 300);

export function SplashScreen({onFinish}: SplashScreenProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Aguarda 3 segundos e então faz fade out
    opacity.value = withDelay(
      3000,
      withTiming(
        0,
        {
          duration: 500,
        },
        finished => {
          if (finished) {
            runOnJS(onFinish)();
          }
        },
      ),
    );
  }, [onFinish, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{flex: 1}, animatedStyle]}>
      <Box
        flex={1}
        backgroundColor="primary"
        justifyContent="center"
        alignItems="center">
        <AnimatedSplashLogo size={logoSize} />
      </Box>
    </Animated.View>
  );
}
