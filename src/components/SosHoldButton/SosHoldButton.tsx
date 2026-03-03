import React, {useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';

import {Box, Text, TouchableOpacityBox} from '@components';

interface SosHoldButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
  holdSeconds?: number;
}

export function SosHoldButton({
  onTrigger,
  disabled = false,
  holdSeconds = 3,
}: SosHoldButtonProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  function startHold() {
    if (disabled) {return;}
    let remaining = holdSeconds;
    setCountdown(remaining);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1.15, duration: 300, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 300, useNativeDriver: true}),
      ]),
    ).start();

    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: 200,
      useNativeDriver: true,
    }).start();

    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        stopHold();
        onTrigger();
      }
    }, 1000);
  }

  function stopHold() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    pulseAnim.stopAnimation();
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    pulseAnim.setValue(1);
  }

  const isHolding = countdown !== null;

  return (
    <Animated.View style={[styles.wrapper, {transform: [{scale: scaleAnim}]}]}>
      {/* Pulse ring visível durante long press */}
      {isHolding && (
        <Animated.View
          style={[
            styles.ring,
            {transform: [{scale: pulseAnim}]},
          ]}
        />
      )}

      <TouchableOpacityBox
        onPressIn={startHold}
        onPressOut={stopHold}
        activeOpacity={0.85}
        disabled={disabled}
        style={[
          styles.button,
          {backgroundColor: isHolding ? '#B91C1C' : '#DC2626'},
        ]}>
        <Box alignItems="center" justifyContent="center">
          {isHolding ? (
            <>
              <Text
                preset="headingMedium"
                bold
                style={{color: '#FFFFFF', fontSize: 28, lineHeight: 32}}>
                {countdown}
              </Text>
              <Text
                preset="paragraphCaptionSmall"
                style={{color: 'rgba(255,255,255,0.85)', marginTop: 2}}>
                Solte para cancelar
              </Text>
            </>
          ) : (
            <>
              <Text
                preset="paragraphMedium"
                bold
                style={{color: '#FFFFFF', fontSize: 22, letterSpacing: 2}}>
                SOS
              </Text>
              <Text
                preset="paragraphCaptionSmall"
                style={{color: 'rgba(255,255,255,0.85)', marginTop: 2}}>
                Manter pressionado
              </Text>
            </>
          )}
        </Box>
      </TouchableOpacityBox>
    </Animated.View>
  );
}

const BUTTON_SIZE = 96;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: BUTTON_SIZE + 32,
    height: BUTTON_SIZE + 32,
  },
  ring: {
    position: 'absolute',
    width: BUTTON_SIZE + 24,
    height: BUTTON_SIZE + 24,
    borderRadius: (BUTTON_SIZE + 24) / 2,
    borderWidth: 3,
    borderColor: 'rgba(220,38,38,0.4)',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
