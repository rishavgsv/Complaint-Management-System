import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicHome from './pages/PublicHome';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

// Informational Pages
import HelpCenter from './pages/HelpCenter';
import StudentGuidelines from './pages/StudentGuidelines';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans flex flex-col">
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/authority" element={<AuthorityDashboard />} />
          <Route path="/worker" element={<WorkerDashboard />} />
          
          {/* Informational Routes */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/guidelines" element={<StudentGuidelines />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
