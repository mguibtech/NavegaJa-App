import {useToastStore, ToastConfig} from '../store/toast.store';

type ShowToastParams = Omit<ToastConfig, 'id' | 'type'>;

class ToastServiceClass {
  success(message: string, options?: Partial<ShowToastParams>) {
    useToastStore.getState().show({
      type: 'success',
      message,
      ...options,
    });
  }

  error(message: string, options?: Partial<ShowToastParams>) {
    useToastStore.getState().show({
      type: 'error',
      message,
      ...options,
    });
  }

  warning(message: string, options?: Partial<ShowToastParams>) {
    useToastStore.getState().show({
      type: 'warning',
      message,
      ...options,
    });
  }

  info(message: string, options?: Partial<ShowToastParams>) {
    useToastStore.getState().show({
      type: 'info',
      message,
      ...options,
    });
  }

  hide(id: string) {
    useToastStore.getState().hide(id);
  }

  hideAll() {
    useToastStore.getState().hideAll();
  }
}

export const ToastService = new ToastServiceClass();
