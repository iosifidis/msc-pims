import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Components Imports
import "react-big-calendar/lib/css/react-big-calendar.css";
import DashboardHome from "./components/DashboardHome";
import ClientForm from "./components/ClientForm";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CalendarPage from "./pages/CalendarPage";
import { AuthProvider, useAuth } from "./context/AuthContext";


// Layout Component for Protected Routes
const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>PIMS - Veterinary Clinic</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>Welcome, <strong>{user?.username || 'User'}</strong></span>
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '8px 16px', 
              cursor: 'pointer',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <nav style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: 0, padding: 0 }}>
          <li><Link to="/" style={navLinkStyle}>Dashboard</Link></li>
          <li><Link to="/calendar" style={navLinkStyle}>Calendar</Link></li>
          <li><Link to="/clients" style={navLinkStyle}>Clients</Link></li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

const navLinkStyle = {
  textDecoration: 'none',
  color: '#1976d2',
  fontWeight: 'bold',
  fontSize: '1.1rem'
};

// Clients Page Component
const ClientsPage = () => {
  const [clients, setClients] = useState([]);

  const fetchClients = () => {
    axios.get("http://localhost:8080/api/clients")
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <section>
      <h2 style={{ color: '#555', marginBottom: '15px' }}>Client Management</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <ClientForm onClientAdded={fetchClients} />
      </div>

      <h3>Client List</h3>
      <div className="client-list">
        {clients.length === 0 ? (
          <p>No clients found.</p>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="client-card" style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              marginBottom: '10px', 
              borderRadius: '5px',
              backgroundColor: '#fff' 
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{client.lastName} {client.firstName}</h3>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Phone:</strong> {client.phone}</p>
              
              <div style={{ marginTop: '10px' }}>
                <strong>Pets:</strong>
                {client.patients && client.patients.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    {client.patients.map((patient) => (
                      <li key={patient.id}>
                        {patient.name} ({patient.species}) - {patient.sex}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ marginLeft: '5px', color: '#777' }}>No pets registered</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/clients" element={<ClientsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
