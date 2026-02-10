import React, {useRef} from 'react';
import {
  Pressable,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from 'react-native';

import {useAppTheme} from '@hooks/useAppTheme';

import {Box} from '../Box/Box';
import {Text} from '../Text/Text';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  errorMessage?: string;
  rightComponent?: React.ReactNode;
}

export function TextInput({
  label,
  errorMessage,
  rightComponent,
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
          borderRadius="s8"
          backgroundColor="surface"
          paddingHorizontal="s12"
          style={{height: 48}}>
          <RNTextInput
            ref={inputRef}
            placeholderTextColor={colors.textLight}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
              },
              style,
            ]}
            {...rnTextInputProps}
          />
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
