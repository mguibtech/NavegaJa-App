import React from 'react';
import {ScrollView} from 'react-native';

import {Box, Button, Text, Icon, TouchableOpacityBox} from '@components';

import {useHelpScreen} from './useHelpScreen';

export function HelpScreen() {
  const {navigation, expandedIndex, toggleFAQ, faqItems, contactOptions} = useHelpScreen();

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingVertical="s16"
        flexDirection="row"
        alignItems="center"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Button
          title=""
          preset="outline"
          leftIcon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Text preset="headingSmall" color="text" bold ml="s12">
          Ajuda e Suporte
        </Text>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <Box mb="s24">
          <Text preset="headingMedium" color="text" bold mb="s16">
            Perguntas Frequentes
          </Text>

          {faqItems.map((item, index) => (
            <TouchableOpacityBox
              key={index}
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              mb="s12"
              onPress={() => toggleFAQ(index)}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Box flex={1} mr="s8">
                  <Text preset="paragraphMedium" color="text" bold>
                    {item.question}
                  </Text>
                </Box>
                <Icon
                  name={expandedIndex === index ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="textSecondary"
                />
              </Box>

              {expandedIndex === index && (
                <Box mt="s12" pt="s12" borderTopWidth={1} borderTopColor="border">
                  <Text preset="paragraphMedium" color="textSecondary">
                    {item.answer}
                  </Text>
                </Box>
              )}
            </TouchableOpacityBox>
          ))}
        </Box>

        {/* Contact Section */}
        <Box mb="s24">
          <Text preset="headingMedium" color="text" bold mb="s16">
            Entre em Contato
          </Text>

          {contactOptions.map(option => (
            <TouchableOpacityBox
              key={option.id}
              flexDirection="row"
              alignItems="center"
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              mb="s12"
              onPress={option.action}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor={option.color === 'primary' ? 'primaryBg' : option.color === 'success' ? 'successBg' : 'secondaryBg'}
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name={option.icon as any} size={24} color={option.color} />
              </Box>

              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold mb="s4">
                  {option.title}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {option.subtitle}
                </Text>
              </Box>

              <Icon name="chevron-right" size={24} color="border" />
            </TouchableOpacityBox>
          ))}
        </Box>

        {/* Quick Tips */}
        <Box
          backgroundColor="infoBg"
          borderRadius="s12"
          padding="s16"
          mb="s24"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: '#2196F3',
          }}>
          <Box flexDirection="row" alignItems="center" mb="s8">
            <Icon name="lightbulb" size={20} color="info" />
            <Text preset="paragraphMedium" color="info" bold ml="s8">
              Dica Rápida
            </Text>
          </Box>
          <Text preset="paragraphMedium" color="info">
            Mantenha suas notificações ativadas para receber atualizações importantes sobre suas
            viagens e encomendas em tempo real!
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
}
