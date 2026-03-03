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

    // Suppress the native volume slider while this hook is active
    VolumeManager.showNativeVolumeUI({enabled: false});

    // Store initial volume as reference
    VolumeManager.getVolume().then(result => {
      prevVolumeRef.current = result.volume;
    });

    const subscription = VolumeManager.addVolumeListener(result => {
      // Skip events triggered by our own setVolume restoration
      if (isRestoringRef.current) {
        return;
      }

      const prev = prevVolumeRef.current;
      const curr = result.volume;

      if (prev === null) {
        prevVolumeRef.current = curr;
        return;
      }

      if (curr < prev - 0.01) {
        // Volume DOWN detected — restore immediately so it doesn't change
        isRestoringRef.current = true;
        VolumeManager.setVolume(prev, {showUI: false}).finally(() => {
          isRestoringRef.current = false;
        });

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
        // Don't update prevVolumeRef — we're restoring to prev
      } else {
        // Volume UP or same — legitimate change, update reference
        prevVolumeRef.current = curr;
      }
    });

    return () => {
      subscription.remove();
      VolumeManager.showNativeVolumeUI({enabled: true});
      if (windowTimerRef.current) {
        clearTimeout(windowTimerRef.current);
        windowTimerRef.current = null;
      }
      pressCountRef.current = 0;
    };
  }, [enabled, pressesRequired, windowMs]);
}
