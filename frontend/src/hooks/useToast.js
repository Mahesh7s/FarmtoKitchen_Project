import { toast } from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
  };

  const showError = (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  };

  const showLoading = (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  };

  const updateToast = (id, message, type = 'success') => {
    toast.dismiss(id);
    if (type === 'success') {
      showSuccess(message);
    } else {
      showError(message);
    }
  };

  return {
    showSuccess,
    showError,
    showLoading,
    updateToast,
    dismiss: toast.dismiss
  };
};