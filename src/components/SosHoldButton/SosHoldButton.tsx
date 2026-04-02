import React, {useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import {Box, Text, TouchableOpacityBox} from '@components';

interface SosHoldButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
  holdSeconds?: number;
}

function getSosButtonStyle(disabled: boolean, isHolding: boolean) {
  return {
    backgroundColor: disabled ? '#9CA3AF' : isHolding ? '#B91C1C' : '#DC2626',
  };
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
        Animated.timing(pulseAnim, {toValue: 1.25, duration: 350, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 350, useNativeDriver: true}),
      ]),
    ).start();

    Animated.timing(scaleAnim, {
      toValue: 0.93,
      duration: 150,
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
      {/* Anel externo estático — sempre visível */}
      <View style={styles.outerRing} />
      <View style={styles.innerRing} />

      {/* Anel pulsante — apenas durante o hold */}
      {isHolding && (
        <Animated.View
          style={[styles.pulseRing, {transform: [{scale: pulseAnim}]}]}
        />
      )}

      <TouchableOpacityBox
        onPressIn={startHold}
        onPressOut={stopHold}
        activeOpacity={0.88}
        disabled={disabled}
        style={[
          styles.button,
          getSosButtonStyle(disabled, isHolding),
        ]}>
        <Box alignItems="center" justifyContent="center">
          {isHolding ? (
            <>
              <Text
                preset="headingMedium"
                bold
                style={styles.countdownText}>
                {countdown}
              </Text>
              <Text
                preset="paragraphCaptionSmall"
                style={styles.cancelText}>
                solte p/ cancelar
              </Text>
            </>
          ) : (
            <>
              <Text
                preset="headingSmall"
                bold
                style={styles.sosLabel}>
                SOS
              </Text>
              <Text
                preset="paragraphCaptionSmall"
                style={styles.holdText}>
                segurar
              </Text>
            </>
          )}
        </Box>
      </TouchableOpacityBox>
    </Animated.View>
  );
}

const BUTTON_SIZE = 88;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: BUTTON_SIZE + 48,
    height: BUTTON_SIZE + 48,
  },
  outerRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 44,
    height: BUTTON_SIZE + 44,
    borderRadius: (BUTTON_SIZE + 44) / 2,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.15)',
    backgroundColor: 'rgba(220,38,38,0.04)',
  },
  innerRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 22,
    height: BUTTON_SIZE + 22,
    borderRadius: (BUTTON_SIZE + 22) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(220,38,38,0.3)',
    backgroundColor: 'rgba(220,38,38,0.06)',
  },
  pulseRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 16,
    height: BUTTON_SIZE + 16,
    borderRadius: (BUTTON_SIZE + 16) / 2,
    borderWidth: 3,
    borderColor: 'rgba(220,38,38,0.55)',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 38,
  },
  cancelText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    marginTop: 1,
  },
  sosLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: 5,
  },
  holdText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginTop: 2,
  },
});
