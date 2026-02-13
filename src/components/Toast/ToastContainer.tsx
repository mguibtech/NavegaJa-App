import React from 'react';
import {StyleSheet, View} from 'react-native';

import {useToastStore} from '@store';
import {Toast} from './Toast';

export function ToastContainer() {
  const {toasts, hide} = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onHide={hide} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
