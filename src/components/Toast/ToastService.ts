import { toast, type ToastOptions } from 'react-toastify'

export const ToastService = {
  success(mensagem: string, opcoes?: ToastOptions) {
    toast.success(mensagem, opcoes)
  },

  error(mensagem: string, opcoes?: ToastOptions) {
    toast.error(mensagem, opcoes)
  },

  warning(mensagem: string, opcoes?: ToastOptions) {
    toast.warning(mensagem, opcoes)
  },

  info(mensagem: string, opcoes?: ToastOptions) {
    toast.info(mensagem, opcoes)
  },

  errorPersistente(mensagem: string, id?: string) {
    toast.error(mensagem, {
      autoClose: false,
      toastId: id,
    })
  },

  dispensar(id: string) {
    toast.dismiss(id)
  },
}
