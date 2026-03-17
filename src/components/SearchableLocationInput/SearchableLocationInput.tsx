import React, {useState, useRef, useCallback} from 'react';
import {
  TextInput as RNTextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';

import { Box, Icon, Text, TouchableOpacityBox } from '@components';
import { LocationSuggestion, locationAPI } from '@domain';
import {useAppTheme} from '@hooks';
import { AM_CITIES } from '@utils';

export interface SearchableLocationInputProps {
  value: string;
  onSelect: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  iconName?: string;
  label?: string;
}

export function SearchableLocationInput({
  value,
  onSelect,
  placeholder = 'Buscar localização',
  iconName = 'place',
  label,
}: SearchableLocationInputProps) {
  const {colors} = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await locationAPI.searchLocations(q);
      setSuggestions(Array.isArray(results) ? results : []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleQueryChange(text: string) {
    setQuery(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 400);
  }

  function handleOpen() {
    setQuery('');
    setSuggestions([]);
    setModalVisible(true);
  }

  function handleClose() {
    setModalVisible(false);
    setQuery('');
    setSuggestions([]);
  }

  function handleSelect(suggestion: LocationSuggestion) {
    onSelect(suggestion);
    handleClose();
  }

  return (
    <>
      <TouchableOpacityBox
        onPress={handleOpen}
        backgroundColor="surface"
        borderRadius="s12"
        borderWidth={1}
        borderColor={value ? 'secondary' : 'border'}
        paddingHorizontal="s16"
        paddingVertical="s16"
        flexDirection="row"
        alignItems="center"
        style={{ elevation: 1 }}>
        <Icon name={iconName} size={20} color={value ? 'secondary' : 'textSecondary'} />
        <Text
          preset="paragraphMedium"
          color={value ? 'text' : 'textSecondary'}
          ml="s12"
          flex={1}>
          {value || placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={20} color="textSecondary" />
      </TouchableOpacityBox>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}>
        <KeyboardAvoidingView
          style={[styles.modalContainer, {backgroundColor: colors.background}]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <Box
            paddingTop="s20"
            paddingHorizontal="s16"
            paddingBottom="s12"
            backgroundColor="surface"
            style={{ elevation: 2 }}>
            {label && (
              <Text preset="headingSmall" color="textSecondary" mb="s8">
                {label}
              </Text>
            )}
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="inputBackground"
              borderRadius="s12"
              borderWidth={1}
              borderColor="border"
              paddingHorizontal="s12"
              paddingVertical="s12">
              <Icon name="search" size={20} color="inputIcon" />
              <RNTextInput
                autoFocus
                value={query}
                onChangeText={handleQueryChange}
                placeholder={placeholder}
                placeholderTextColor={colors.inputPlaceholder}
                style={[styles.searchInput, {color: colors.text}]}
                allowFontScaling={false}
                returnKeyType="search"
                cursorColor={colors.text}
                selectionColor={colors.primaryLight}
                underlineColorAndroid="transparent"
              />
              {query.length > 0 && (
                <TouchableOpacityBox onPress={() => { setQuery(''); setSuggestions([]); }}>
                  <Icon name="close" size={20} color="inputIcon" />
                </TouchableOpacityBox>
              )}
            </Box>
          </Box>

          {/* Suggestions */}
          {isLoading ? (
            <Box flex={1} alignItems="center" justifyContent="center">
              <ActivityIndicator size="large" color={colors.primary} />
            </Box>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item, idx) => `${item.name}_${idx}`}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                query.length >= 2 && !isLoading ? (
                  <Box alignItems="center" mt="s32" paddingHorizontal="s24">
                    <Icon name="location-off" size={48} color="textSecondary" />
                    <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
                      Nenhuma localização encontrada.{'\n'}Tente outro termo.
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    {AM_CITIES.map(city => (
                      <TouchableOpacityBox
                        key={city}
                        onPress={() =>
                          handleSelect({
                            name: city,
                            city,
                            state: 'AM',
                            type: 'city',
                          })
                        }
                        flexDirection="row"
                        alignItems="center"
                        paddingHorizontal="s16"
                        paddingVertical="s14"
                        borderBottomWidth={1}
                        borderBottomColor="border"
                        backgroundColor="surface">
                        <Box
                          width={36}
                          height={36}
                          borderRadius="s20"
                          backgroundColor="secondaryBg"
                          alignItems="center"
                          justifyContent="center"
                          mr="s12">
                          <Icon name="location-city" size={18} color="secondary" />
                        </Box>

                        <Box flex={1}>
                          <Text preset="paragraphMedium">{city}</Text>
                          <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                            Amazonas, AM
                          </Text>
                        </Box>
                      </TouchableOpacityBox>
                    ))}
                  </Box>
                )
              }
              renderItem={({ item }) => (
                <TouchableOpacityBox
                  onPress={() => handleSelect(item)}
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal="s16"
                  paddingVertical="s14"
                  borderBottomWidth={1}
                  borderBottomColor="border"
                  backgroundColor="surface">
                  <Box
                    width={36}
                    height={36}
                    borderRadius="s20"
                    backgroundColor="secondaryBg"
                    alignItems="center"
                    justifyContent="center"
                    mr="s12">
                    <Icon
                      name={item.type === 'city' ? 'location-city' : 'place'}
                      size={18}
                      color="secondary"
                    />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphMedium" color="text">
                      {item.name}
                    </Text>
                    {item.city && (
                      <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                        {item.city}{item.state ? `, ${item.state}` : ''}
                      </Text>
                    )}
                  </Box>
                  <Icon name="chevron-right" size={20} color="textSecondary" />
                </TouchableOpacityBox>
              )}
            />
          )}

          {/* Cancel */}
          <Box
            paddingHorizontal="s16"
            paddingVertical="s16"
            backgroundColor="surface"
            borderTopWidth={1}
            borderTopColor="border">
            <TouchableOpacityBox
              onPress={handleClose}
              alignItems="center"
              paddingVertical="s12">
              <Text preset="paragraphMedium" color="secondary" bold>
                Cancelar
              </Text>
            </TouchableOpacityBox>
          </Box>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
});
