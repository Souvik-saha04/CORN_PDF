import WelcomePage from '../pages/Welcomepage';
import Dashboard from '../pages/Dashboard';
import { ProtectedRoute } from "../pages/components/protected_routes"
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { Login } from "../pages/Authentication/Login"
import { Signup } from "../pages/Authentication/Signup"
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}