import { ToastContainer } from 'react-toastify'

export function Toast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      draggable
      theme="colored"
      aria-label="Notificações"
      closeButton={({ closeToast }) => (
        <button
          type="button"
          className="Toastify__close-button"
          aria-label="Fechar notificação"
          onClick={closeToast}
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    />
  )
}
