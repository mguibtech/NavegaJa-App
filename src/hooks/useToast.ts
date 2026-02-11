import {ToastService} from '../services/toastService';

export function useToast() {
  return {
    showSuccess: ToastService.success.bind(ToastService),
    showError: ToastService.error.bind(ToastService),
    showWarning: ToastService.warning.bind(ToastService),
    showInfo: ToastService.info.bind(ToastService),
    hide: ToastService.hide.bind(ToastService),
    hideAll: ToastService.hideAll.bind(ToastService),
  };
}
