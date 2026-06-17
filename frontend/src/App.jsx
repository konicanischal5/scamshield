import { Routes, Route, NavLink } from 'react-router-dom'
import { Shield, BarChart2, FileText } from 'lucide-react'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Reports from './pages/Reports.jsx'

export default function App() {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="nav-logo">
          <div className="logo-badge">🛡️</div>
          ScamShield
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Analyze
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Community Reports
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </>
  )
}
