import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import LabDetails from './pages/LabDetails';
import Compare from './pages/Compare';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import LabDashboard from './pages/LabDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';

import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/lab/:id" element={<LabDetails />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/lab-dashboard" element={<LabDashboard />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
