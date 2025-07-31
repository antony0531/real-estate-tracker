import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { MyWork } from './pages/MyWork';
import { Notifications } from './pages/Notifications';
import { More } from './pages/More';
import { ProjectsDashboard } from './pages/ProjectsDashboard';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { ProjectOverview } from './pages/ProjectOverview';
import { ProjectExpenses } from './pages/ProjectExpenses';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileNav } from './components/MobileNav';
import { QuickAddButton } from './components/QuickAddButton';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100 md:bg-background-secondary pb-16 md:pb-0">
                  <MobileHeader />
                  <div className="hidden md:block">
                    <Header />
                  </div>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/my-work" element={<MyWork />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/more" element={<More />} />
                    <Route path="/projects" element={<ProjectsDashboard />} />
                    <Route path="/project/:id/overview" element={<ProjectDashboard />} />
                    <Route path="/project/:id/expenses" element={<ProjectExpenses />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  </Routes>
                  <MobileNav />
                  <QuickAddButton />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;