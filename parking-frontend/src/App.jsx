import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import ParkingList from './pages/ParkingList'
import Reserve from './pages/Reserve'
import MyReservations from './pages/MyReservations'
import Pay from './pages/Pay'
import Receipt from './pages/Receipt'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageLots from './pages/admin/ManageLots'
import ReservationsAdmin from './pages/admin/ReservationsAdmin'
import Reports from './pages/admin/Reports'
import UserManagement from './pages/admin/UserManagement'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/parking" element={<ParkingList />} />
        {/* Driver */}
        <Route element={<ProtectedRoute roles={['driver', 'admin']} />}>
          <Route path="/reserve/:lotId" element={<Reserve />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/pay/:reservationId" element={<Pay />} />
          <Route path="/receipt/:reservationId" element={<Receipt />} />
        </Route>
        {/* Admin */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/lots" element={<ManageLots />} />
          <Route path="/admin/reservations" element={<ReservationsAdmin />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
