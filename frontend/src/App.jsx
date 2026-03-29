import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MasterSetup from './pages/MasterSetup';
import Applicants from './pages/Applicants';
import SeatAllocation from './pages/SeatAllocation';
import AdmissionConfirmation from './pages/AdmissionConfirmation';

import Landing from './pages/Landing';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        className: 'text-sm font-medium rounded-lg shadow-lg',
        success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="master" element={<MasterSetup />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="allocation" element={<SeatAllocation />} />
          <Route path="admission" element={<AdmissionConfirmation />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
