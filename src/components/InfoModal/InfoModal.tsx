import React, {useEffect, useRef} from 'react';
import {Modal, Animated, StyleSheet} from 'react-native';

import {Box, Button, Text, Icon} from '@components';

export interface InfoModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  buttonText?: string;
  onClose: () => void;
}

export function InfoModal({
  visible,
  title,
  message,
  icon = 'info',
  iconColor = 'info',
  buttonText = 'Entendi',
  onClose,
}: InfoModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Bounce animation for icon
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [visible]);

  const iconBgMap = {
    primary: 'primaryBg' as const,
    success: 'successBg' as const,
    warning: 'warningBg' as const,
    danger: 'dangerBg' as const,
    info: 'infoBg' as const,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}>
        <Box
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="s20">
          <Animated.View
            style={{
              transform: [{scale: scaleAnim}],
              width: '100%',
              maxWidth: 400,
            }}>
            <Box
              backgroundColor="surface"
              borderRadius="s24"
              padding="s32"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 8},
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 12,
              }}>
              {/* Icon with bounce */}
              <Box alignItems="center" mb="s24">
                <Animated.View
                  style={{
                    transform: [{scale: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.15],
                    })}],
                  }}>
                  <Box
                    width={80}
                    height={80}
                    borderRadius="s24"
                    backgroundColor={iconBgMap[iconColor]}
                    alignItems="center"
                    justifyContent="center">
                    <Icon name={icon} size={48} color={iconColor} />
                  </Box>
                </Animated.View>
              </Box>

              {/* Title */}
              <Text
                preset="headingMedium"
                color="text"
                bold
                textAlign="center"
                mb="s12">
                {title}
              </Text>

              {/* Message */}
              <Text
                preset="paragraphMedium"
                color="textSecondary"
                textAlign="center"
                mb="s32">
                {message}
              </Text>

              {/* Button */}
              <Button
                title={buttonText}
                preset="primary"
                onPress={onClose}
              />
            </Box>
          </Animated.View>
        </Box>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
