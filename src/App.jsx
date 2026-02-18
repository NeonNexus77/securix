import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import LandingPage from './LandingPage';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import TADashboard from './TADashboard';
import FacultyDashboard from './FacultyDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/ta-dashboard" element={<TADashboard />} />
      </Routes>
    </Router>
  );
}

export default App;