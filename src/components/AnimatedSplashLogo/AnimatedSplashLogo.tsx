import React, {useEffect, useRef} from 'react';
import Svg, {
  Rect,
  Circle,
  Path,
  Line,
  G,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

interface AnimatedSplashLogoProps {
  size?: number;
}

export function AnimatedSplashLogo({size = 300}: AnimatedSplashLogoProps) {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const glowProgress = useSharedValue(0);
  const boatOpacity = useSharedValue(0);
  const cabinOpacity = useSharedValue(0);
  const windowOpacity = useSharedValue(0);
  const mastProgress = useSharedValue(0);
  const flagOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const flagRotation = useSharedValue(0);

  useEffect(() => {
    const schedule = (callback: () => void, delay: number) => {
      const timeout = setTimeout(callback, delay);
      timeoutsRef.current.push(timeout);
    };

    glowProgress.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );

    boatOpacity.value = withTiming(1, {duration: 1000});

    schedule(() => {
      cabinOpacity.value = withTiming(1, {duration: 1000});
    }, 300);

    schedule(() => {
      windowOpacity.value = withTiming(0.3, {duration: 1000});
    }, 500);

    schedule(() => {
      mastProgress.value = withTiming(1, {duration: 1000});
    }, 500);

    schedule(() => {
      flagOpacity.value = withTiming(1, {duration: 500});
    }, 1000);

    schedule(() => {
      textOpacity.value = withTiming(1, {duration: 500});
    }, 1500);

    schedule(() => {
      flagRotation.value = withRepeat(
        withSequence(
          withTiming(5, {duration: 500, easing: Easing.inOut(Easing.ease)}),
          withTiming(-5, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
          withTiming(0, {duration: 500, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        false,
      );
    }, 1500);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowAnimatedProps = useAnimatedProps(() => ({
    r: interpolate(glowProgress.value, [0, 1], [140, 150]),
    opacity: interpolate(glowProgress.value, [0, 1], [0.5, 0.8]),
  }));

  const mastAnimatedProps = useAnimatedProps(() => ({
    y2: interpolate(mastProgress.value, [0, 1], [-18, -45]),
  }));

  const flagAnimatedProps = useAnimatedProps(() => ({
    opacity: flagOpacity.value,
  }));

  const flagTransform = `rotate(${flagRotation.value} 0 -45)`;

  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      <Defs>
        <RadialGradient id="glowGradient">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <AnimatedCircle
        cx="150"
        cy="150"
        fill="url(#glowGradient)"
        animatedProps={glowAnimatedProps}
      />

      <G>
        <Path
          d="M 30 150 Q 90 120, 150 150 T 270 150"
          stroke="white"
          strokeWidth="4"
          fill="none"
          opacity="0.3"
        />
        <Path
          d="M 30 170 Q 90 140, 150 170 T 270 170"
          stroke="white"
          strokeWidth="4"
          fill="none"
          opacity="0.2"
        />
      </G>

      <G transform="translate(150, 135)">
        <AnimatedPath
          d="M -50 0 L -42 30 L 42 30 L 50 0 Z"
          fill="white"
          animatedProps={useAnimatedProps(() => ({
            opacity: boatOpacity.value,
          }))}
        />

        <AnimatedRect
          x={-25}
          y={-18}
          width={50}
          height={18}
          rx={4}
          fill="white"
          animatedProps={useAnimatedProps(() => ({
            opacity: cabinOpacity.value,
          }))}
        />

        <AnimatedRect
          x={-18}
          y={-13}
          width={12}
          height={8}
          rx={2}
          fill="#064E73"
          animatedProps={useAnimatedProps(() => ({
            opacity: windowOpacity.value,
          }))}
        />
        <AnimatedRect
          x={6}
          y={-13}
          width={12}
          height={8}
          rx={2}
          fill="#064E73"
          animatedProps={useAnimatedProps(() => ({
            opacity: windowOpacity.value,
          }))}
        />

        <AnimatedLine
          x1={0}
          y1={-18}
          x2={0}
          stroke="white"
          strokeWidth={4}
          animatedProps={mastAnimatedProps}
        />

        <AnimatedPath
          d="M 0 -45 L 20 -36 L 0 -27 Z"
          fill="#E8960C"
          transform={flagTransform}
          origin="0, -45"
          animatedProps={flagAnimatedProps}
        />

        <AnimatedCircle
          cx={0}
          cy={-45}
          r={3}
          fill="#E8960C"
          animatedProps={useAnimatedProps(() => ({
            opacity: flagOpacity.value,
          }))}
        />
      </G>

      <AnimatedSvgText
        x="150"
        y="240"
        fontSize="32"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
        animatedProps={useAnimatedProps(() => ({
          opacity: textOpacity.value,
        }))}>
        NavegaJá
      </AnimatedSvgText>
    </Svg>
  );
}
