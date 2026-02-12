import React, {useState} from 'react';
import {Dimensions, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel from 'react-native-reanimated-carousel';

import {Box, Button, Icon, Text} from '@components';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const ONBOARDED_KEY = '@navegaja:onboarded';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: 'directions-boat',
    title: 'Navegue pelos rios da Amazônia',
    description: 'Encontre viagens de barco para qualquer destino na região',
  },
  {
    icon: 'verified-user',
    title: 'Viaje com segurança',
    description: 'Barqueiros verificados e avaliados pela comunidade',
  },
  {
    icon: 'map',
    title: 'Rastreamento em tempo real',
    description: 'Acompanhe sua viagem pelo rio em tempo real',
  },
];

export function OnboardingScreen({onComplete}: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === slides.length - 1;

  async function handleComplete() {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    onComplete();
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Skip Button */}
      <Box position="absolute" top={56} right={24} zIndex={10}>
        <Pressable onPress={handleComplete}>
          <Text preset="paragraphMedium" color="textSecondary" semibold>
            Pular
          </Text>
        </Pressable>
      </Box>

      {/* Carousel */}
      <Box flex={1} justifyContent="center" alignItems="center">
        <Carousel
          width={SCREEN_WIDTH}
          height={500}
          data={slides}
          loop={false}
          onSnapToItem={setCurrentIndex}
          renderItem={({item}) => (
            <Box flex={1} justifyContent="center" alignItems="center" px="s32">
              <Box
                width={120}
                height={120}
                backgroundColor="primaryBg"
                borderRadius="s20"
                alignItems="center"
                justifyContent="center"
                mb="s32">
                <Icon name={item.icon} size={64} color="primary" />
              </Box>

              <Text
                preset="headingMedium"
                color="text"
                bold
                textAlign="center"
                mb="s16">
                {item.title}
              </Text>

              <Text
                preset="paragraphLarge"
                color="textSecondary"
                textAlign="center"
                paddingHorizontal="s24">
                {item.description}
              </Text>
            </Box>
          )}
        />
      </Box>

      {/* Dots Indicator */}
      <Box
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        mb="s24"
        gap="s8">
        {slides.map((_, index) => (
          <Box
            key={index}
            width={currentIndex === index ? 24 : 8}
            height={8}
            borderRadius="s8"
            backgroundColor={
              currentIndex === index ? 'primary' : 'disabled'
            }
          />
        ))}
      </Box>

      {/* Start Button - Only on last slide */}
      {isLastSlide && (
        <Box paddingHorizontal="s24" mb="s32">
          <Button
            title="Começar"
            onPress={handleComplete}
            rightIcon="arrow-forward"
          />
        </Box>
      )}
    </Box>
  );
}
