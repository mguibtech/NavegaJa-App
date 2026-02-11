import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export function Logo({size = 96}: LogoProps) {
  const scale = size / 200;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* Gradientes */}
      <Defs>
        <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0B5D8A" stopOpacity="1" />
          <Stop offset="50%" stopColor="#22874A" stopOpacity="1" />
          <Stop offset="100%" stopColor="#0B5D8A" stopOpacity="1" />
        </LinearGradient>

        <LinearGradient id="boatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="100%" stopColor="#E5E9EC" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Círculo base */}
      <Circle cx="100" cy="100" r="90" fill="url(#waterGradient)" opacity="0.15" />
      <Circle cx="100" cy="100" r="80" fill="url(#waterGradient)" />

      {/* Ondas do rio */}
      <Path
        d="M 30 100 Q 50 90, 70 100 T 110 100 T 150 100 T 190 100"
        stroke="white"
        strokeWidth="3"
        fill="none"
        opacity="0.3"
      />
      <Path
        d="M 30 110 Q 50 100, 70 110 T 110 110 T 150 110 T 190 110"
        stroke="white"
        strokeWidth="3"
        fill="none"
        opacity="0.2"
      />

      {/* Barco */}
      <G transform="translate(100, 85)">
        {/* Casco do barco */}
        <Path
          d="M -30 0 L -25 20 L 25 20 L 30 0 Z"
          fill="url(#boatGradient)"
          stroke="#0B5D8A"
          strokeWidth="2"
        />

        {/* Cabine */}
        <Rect
          x="-15"
          y="-10"
          width="30"
          height="10"
          rx="2"
          fill="#FFFFFF"
          stroke="#0B5D8A"
          strokeWidth="2"
        />

        {/* Janelas */}
        <Rect x="-10" y="-7" width="6" height="4" rx="1" fill="#0B5D8A" opacity="0.3" />
        <Rect x="4" y="-7" width="6" height="4" rx="1" fill="#0B5D8A" opacity="0.3" />

        {/* Mastro com bandeira */}
        <Line x1="0" y1="-10" x2="0" y2="-25" stroke="#0B5D8A" strokeWidth="2" />
        <Path d="M 0 -25 L 12 -20 L 0 -15 Z" fill="#E8960C" />
      </G>

      {/* Reflexo do sol na água */}
      <Circle cx="140" cy="60" r="8" fill="#E8960C" opacity="0.4" />
      <Circle cx="145" cy="65" r="5" fill="#E8960C" opacity="0.3" />
    </Svg>
  );
}
