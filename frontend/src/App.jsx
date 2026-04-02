import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MasterSetup from './pages/MasterSetup';
import Applicants from './pages/Applicants';
import SeatAllocation from './pages/SeatAllocation';
import AdmissionConfirmation from './pages/AdmissionConfirmation';
import Landing from './pages/Landing';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        className: 'text-sm font-medium rounded-lg shadow-lg',
        success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/app" element={
          <ProtectedRoute roles={['Admin', 'Admission Officer', 'Management']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="master" element={
            <ProtectedRoute roles={['Admin']}>
              <MasterSetup />
            </ProtectedRoute>
          } />
          <Route path="applicants" element={
            <ProtectedRoute roles={['Admin', 'Admission Officer']}>
              <Applicants />
            </ProtectedRoute>
          } />
          <Route path="allocation" element={
            <ProtectedRoute roles={['Admin', 'Admission Officer']}>
              <SeatAllocation />
            </ProtectedRoute>
          } />
          <Route path="admission" element={
            <ProtectedRoute roles={['Admin', 'Admission Officer']}>
              <AdmissionConfirmation />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
