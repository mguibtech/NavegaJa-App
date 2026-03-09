import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';

import VolumeManager from 'react-native-volume-manager';

interface UseVolumeButtonSosOptions {
  /** Called when the required number of volume-down presses is reached */
  onTrigger: () => void;
  /** Called on each press before triggering, with remaining presses count */
  onHint?: (remaining: number) => void;
  /** Number of consecutive Volume Down presses required. Default: 3 */
  pressesRequired?: number;
  /** Time window in ms to complete all presses. Default: 2000 */
  windowMs?: number;
  /** Whether the listener is active. Default: true */
  enabled?: boolean;
}

/**
 * Detects N consecutive Volume Down presses within a time window and fires onTrigger.
 * Restores the volume after each press so it doesn't actually change.
 * Android only — no-op on iOS.
 */
export function useVolumeButtonSos({
  onTrigger,
  onHint,
  pressesRequired = 3,
  windowMs = 2000,
  enabled = true,
}: UseVolumeButtonSosOptions) {
  const pressCountRef = useRef(0);
  const windowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevVolumeRef = useRef<number | null>(null);
  // Flag to ignore the listener event fired by our own setVolume restoration
  const isRestoringRef = useRef(false);

  // Keep callbacks in refs to avoid re-subscribing on every render
  const onTriggerRef = useRef(onTrigger);
  const onHintRef = useRef(onHint);
  useEffect(() => {
    onTriggerRef.current = onTrigger;
    onHintRef.current = onHint;
  });

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') {
      return;
    }

    // Guard: native module not linked until the app is rebuilt
    if (!VolumeManager || typeof VolumeManager.addVolumeListener !== 'function') {
      return;
    }

    VolumeManager.showNativeVolumeUI({enabled: true});

    // Store initial volume as reference
    VolumeManager.getVolume().then(result => {
      prevVolumeRef.current = result.volume;
    });

    const subscription = VolumeManager.addVolumeListener(result => {
      const prev = prevVolumeRef.current;
      const curr = result.volume;

      if (prev === null) {
        prevVolumeRef.current = curr;
        return;
      }

      // This event was fired by our own restoration — skip it
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        return;
      }

      if (curr < prev - 0.01) {
        // Volume DOWN detectado — restaura para não alterar o som
        isRestoringRef.current = true;
        VolumeManager.setVolume(prev);

        pressCountRef.current += 1;
        const remaining = pressesRequired - pressCountRef.current;

        if (windowTimerRef.current) {
          clearTimeout(windowTimerRef.current);
        }

        if (pressCountRef.current >= pressesRequired) {
          // Threshold reached — trigger SOS
          pressCountRef.current = 0;
          onTriggerRef.current();
        } else {
          // Show hint and reset window
          onHintRef.current?.(remaining);
          windowTimerRef.current = setTimeout(() => {
            pressCountRef.current = 0;
          }, windowMs);
        }
      } else {
        // Volume UP or same — legitimate change, update reference
        prevVolumeRef.current = curr;
      }
    });

    return () => {
      subscription.remove();
      if (windowTimerRef.current) {
        clearTimeout(windowTimerRef.current);
        windowTimerRef.current = null;
      }
      pressCountRef.current = 0;
      isRestoringRef.current = false;
    };
  }, [enabled, pressesRequired, windowMs]);
}
