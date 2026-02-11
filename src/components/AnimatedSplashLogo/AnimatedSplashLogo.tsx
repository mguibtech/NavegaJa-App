import React, {useEffect} from 'react';
import Svg, {
  Rect,
  Circle,
  Path,
  Line,
  G,
  Defs,
  LinearGradient as SvgLinearGradient,
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
  // Animação do glow pulsante
  const glowProgress = useSharedValue(0);

  // Animações do barco (fade-in sequencial)
  const boatOpacity = useSharedValue(0);
  const cabinOpacity = useSharedValue(0);
  const windowOpacity = useSharedValue(0);
  const mastProgress = useSharedValue(0);
  const flagOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  // Animação da bandeira (rotação)
  const flagRotation = useSharedValue(0);

  useEffect(() => {
    // Glow pulsante infinito
    glowProgress.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );

    // Animações sequenciais do barco
    boatOpacity.value = withTiming(1, {duration: 1000});

    setTimeout(() => {
      cabinOpacity.value = withTiming(1, {duration: 1000});
    }, 300);

    setTimeout(() => {
      windowOpacity.value = withTiming(0.3, {duration: 1000});
    }, 500);

    setTimeout(() => {
      mastProgress.value = withTiming(1, {duration: 1000});
    }, 500);

    setTimeout(() => {
      flagOpacity.value = withTiming(1, {duration: 500});
    }, 1000);

    setTimeout(() => {
      textOpacity.value = withTiming(1, {duration: 500});
    }, 1500);

    // Animação da bandeira (começa após 1.5s)
    setTimeout(() => {
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
  }, []);

  // Props animadas para o glow
  const glowAnimatedProps = useAnimatedProps(() => ({
    r: interpolate(glowProgress.value, [0, 1], [140, 150]),
    opacity: interpolate(glowProgress.value, [0, 1], [0.5, 0.8]),
  }));

  // Props animadas para o mastro
  const mastAnimatedProps = useAnimatedProps(() => ({
    y2: interpolate(mastProgress.value, [0, 1], [-18, -45]),
  }));

  // Props animadas para a bandeira
  const flagAnimatedProps = useAnimatedProps(() => ({
    opacity: flagOpacity.value,
  }));

  const flagTransform = `rotate(${flagRotation.value} 0 -45)`;

  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      {/* Gradientes */}
      <Defs>
        <SvgLinearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0B5D8A" stopOpacity="1" />
          <Stop offset="100%" stopColor="#075985" stopOpacity="1" />
        </SvgLinearGradient>

        <RadialGradient id="glowGradient">
          <Stop offset="0%" stopColor="#0B5D8A" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#0B5D8A" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Fundo com gradiente */}
      <Rect width="300" height="300" fill="url(#splashGradient)" />

      {/* Glow effect pulsante */}
      <AnimatedCircle
        cx="150"
        cy="150"
        fill="url(#glowGradient)"
        animatedProps={glowAnimatedProps}
      />

      {/* Ondas (estáticas para simplicidade) */}
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

      {/* Barco */}
      <G transform="translate(150, 135)">
        {/* Casco */}
        <AnimatedPath
          d="M -50 0 L -42 30 L 42 30 L 50 0 Z"
          fill="white"
          animatedProps={useAnimatedProps(() => ({
            opacity: boatOpacity.value,
          }))}
        />

        {/* Cabine */}
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

        {/* Janelas */}
        <AnimatedRect
          x={-18}
          y={-13}
          width={12}
          height={8}
          rx={2}
          fill="#0B5D8A"
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
          fill="#0B5D8A"
          animatedProps={useAnimatedProps(() => ({
            opacity: windowOpacity.value,
          }))}
        />

        {/* Mastro */}
        <AnimatedLine
          x1={0}
          y1={-18}
          x2={0}
          stroke="white"
          strokeWidth={4}
          animatedProps={mastAnimatedProps}
        />

        {/* Bandeira */}
        <AnimatedPath
          d="M 0 -45 L 20 -36 L 0 -27 Z"
          fill="#E8960C"
          transform={flagTransform}
          origin="0, -45"
          animatedProps={flagAnimatedProps}
        />

        {/* Círculo no topo do mastro */}
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

      {/* Texto NavegaJá */}
      <AnimatedSvgText
        x="150"
        y="240"
        fontSize="32"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
        animatedProps={useAnimatedProps(() => ({
          opacity: textOpacity.value,
        }))}
      >
        NavegaJá
      </AnimatedSvgText>
    </Svg>
  );
}
