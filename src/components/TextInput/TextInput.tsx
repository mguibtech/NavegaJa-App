import React, {useRef} from 'react';
import {
  Pressable,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from 'react-native';

import {useAppTheme} from '@hooks';
import {ThemeColors} from '@theme';

import {Box} from '@components';
import {Icon} from '@components';
import {Text} from '@components';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  errorMessage?: string;
  rightComponent?: React.ReactNode;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  leftIconColor?: ThemeColors;
  rightIconColor?: ThemeColors;
}

export function TextInput({
  label,
  errorMessage,
  rightComponent,
  leftIcon,
  rightIcon,
  onRightIconPress,
  leftIconColor = 'textLight',
  rightIconColor = 'textLight',
  style,
  ...rnTextInputProps
}: TextInputProps) {
  const {colors} = useAppTheme();
  const inputRef = useRef<RNTextInput>(null);
  const hasError = !!errorMessage;

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
          backgroundColor="surface"
          paddingHorizontal="s16"
          style={{height: 56}}>
          {leftIcon && (
            <Box mr="s12">
              <Icon name={leftIcon} size={20} color={leftIconColor} />
            </Box>
          )}
          <RNTextInput
            ref={inputRef}
            placeholderTextColor={colors.textLight}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: 'Poppins-Regular',
                fontSize: 16,
              },
              style,
            ]}
            {...rnTextInputProps}
          />
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
  input: {
    flex: 1,
    padding: 0,
  },
});
