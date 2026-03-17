import React, {useRef, useState} from 'react';
import {
  Pressable,
  TextStyle,
  ViewStyle,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from 'react-native';

import {useAppTheme} from '@hooks';
import {ThemeColors} from '@theme';

import {Box} from '@components';
import {Icon} from '@components';
import {Text} from '@components';
import { TextVariants } from '../Text/Text';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  errorMessage?: string;
  rightComponent?: React.ReactNode;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  leftIconColor?: ThemeColors;
  rightIconColor?: ThemeColors;
  containerBackgroundColor?: ThemeColors;
  containerStyle?: ViewStyle;
  placeholderPreset?: TextVariants;
  placeholderStyle?: TextStyle;
}

export function TextInput({
  label,
  errorMessage,
  rightComponent,
  leftIcon,
  rightIcon,
  onRightIconPress,
  leftIconColor = 'inputIcon',
  rightIconColor = 'inputIcon',
  containerBackgroundColor = 'surface',
  containerStyle,
  placeholderPreset,
  placeholderStyle,
  style,
  ...rnTextInputProps
}: TextInputProps) {
  const {colors} = useAppTheme();
  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errorMessage;
  const hasValue =
    rnTextInputProps.value !== undefined &&
    rnTextInputProps.value !== null &&
    String(rnTextInputProps.value).length > 0;
  const shouldRenderCustomPlaceholder =
    !!placeholderPreset && !!rnTextInputProps.placeholder && !hasValue && !isFocused;

  return (
    <Box>
      {label && (
        <Text preset="paragraphSmall" semibold mb="s4">
          {label}
        </Text>
      )}
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Box
          flexDirection="row"
          alignItems="center"
          borderWidth={hasError ? 2 : 1}
          borderColor={hasError ? 'danger' : 'border'}
          borderRadius="s12"
          backgroundColor={containerBackgroundColor}
          paddingHorizontal="s16"
          style={[styles.container, containerStyle]}>
          {leftIcon && (
            <Box mr="s12">
              <Icon name={leftIcon} size={20} color={leftIconColor} />
            </Box>
          )}
          <Box flex={1} justifyContent="center">
            {shouldRenderCustomPlaceholder && (
              <Box pointerEvents="none" style={styles.placeholderContainer}>
                <Text
                  preset={placeholderPreset}
                  style={[styles.placeholderText, {color: colors.inputPlaceholder}, placeholderStyle]}>
                  {rnTextInputProps.placeholder}
                </Text>
              </Box>
            )}
            <RNTextInput
              ref={inputRef}
              allowFontScaling={false}
              cursorColor={colors.text}
              selectionColor={colors.primaryLight}
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.inputBase,
                {
                  color: colors.text,
                },
                style,
              ]}
              {...rnTextInputProps}
              onFocus={event => {
                setIsFocused(true);
                rnTextInputProps.onFocus?.(event);
              }}
              onBlur={event => {
                setIsFocused(false);
                rnTextInputProps.onBlur?.(event);
              }}
              placeholder={placeholderPreset ? '' : rnTextInputProps.placeholder}
              underlineColorAndroid="transparent"
            />
          </Box>
          {rightIcon && (
            <Box ml="s12">
              <Icon
                name={rightIcon}
                size={20}
                color={rightIconColor}
                onPress={onRightIconPress}
              />
            </Box>
          )}
          {rightComponent && <Box ml="s8">{rightComponent}</Box>}
        </Box>
      </Pressable>
      {hasError && (
        <Text preset="paragraphSmall" color="danger" bold mt="s4">
          {errorMessage}
        </Text>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
  },
  inputBase: {
    flex: 1,
    padding: 0,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    includeFontPadding: false,
    zIndex: 1,
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    zIndex: 0,
  },
  placeholderText: {
    includeFontPadding: false,
  },
});
