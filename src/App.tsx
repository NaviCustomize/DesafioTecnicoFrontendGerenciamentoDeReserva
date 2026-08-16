import { Route, Routes } from 'react-router-dom'
import { RotaInicial } from './components/RotaInicial'
import 'react-toastify/dist/ReactToastify.css'
import { Toast } from './components/Toast'
import { AuthProvider } from './context/AuthContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { PrivateRoute } from './components/PrivateRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminPage } from './pages/Admin/AdminPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { LoginPage } from './pages/Login/LoginPage'
import { CadastroPage } from './pages/Cadastro/CadastroPage'
import { ReservasPage } from './pages/Reservas/ReservasPage'
import { HistoricoPage } from './pages/Historico/HistoricoPage'
import { PerfilPage } from './pages/Perfil/PerfilPage'

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <Toast />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route
            path="/reservas"
            element={
              <PrivateRoute>
                <ReservasPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <PrivateRoute>
                <HistoricoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/painel"
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <PerfilPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<RotaInicial />} />
          <Route path="*" element={<RotaInicial />} />
        </Routes>
      </AuthProvider>
    </AccessibilityProvider>
  )
}

export default App
