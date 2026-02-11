import {create} from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastStore {
  toasts: ToastConfig[];
  show: (config: Omit<ToastConfig, 'id'>) => void;
  hide: (id: string) => void;
  hideAll: () => void;
}

export const useToastStore = create<ToastStore>(set => ({
  toasts: [],

  show: config => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const duration = config.duration ?? 3000;

    set(state => ({
      toasts: [
        ...state.toasts,
        {
          ...config,
          id,
          duration,
        },
      ],
    }));

    // Auto-hide após duration
    if (duration > 0) {
      setTimeout(() => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      }, duration);
    }
  },

  hide: id => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  hideAll: () => {
    set({toasts: []});
  },
}));
