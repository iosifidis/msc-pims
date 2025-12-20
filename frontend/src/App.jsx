import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Components Imports
import DashboardHome from "./components/DashboardHome";
import ClientForm from "./components/ClientForm";
import CalendarView from "./components/CalendarView";
import AppointmentForm from "./components/AppointmentForm";

function App() {
  const [clients, setClients] = useState([]);

  // Συνάρτηση που φορτώνει τους πελάτες
  const fetchClients = () => {
    axios.get("http://localhost:8080/api/clients")
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // Φόρτωση κατά την εκκίνηση
  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        PIMS - Veterinary Clinic Management
      </h1>

      {/* --- 1. DASHBOARD --- */}
      <section style={{ marginBottom: '40px' }}>
        <DashboardHome />
      </section>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #eee' }} />

      {/* --- 2. ΗΜΕΡΟΛΟΓΙΟ --- */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#555', marginBottom: '15px' }}>Calendar</h2>
        {/* Εδώ εμφανίζεται το Ημερολόγιο */}
        <CalendarView />
      </section>

      {/* --- 3. ΝΕΟ ΡΑΝΤΕΒΟΥ --- */}
      <section style={{ marginBottom: '40px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <AppointmentForm onAppointmentAdded={() => {
           console.log("New appointment created - refresh logic can go here");
           // Αν θες να ανανεώνονται και τα στατιστικά, 
           // θα μπορούσες να περάσεις μια συνάρτηση refresh και στο Dashboard, 
           // αλλά για την ώρα αρκεί ένα F5.
        }} />
      </section>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #eee' }} />

      {/* --- 4. ΠΕΛΑΤΕΣ --- */}
      <section>
        <h2 style={{ color: '#555', marginBottom: '15px' }}>Client Management</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <ClientForm onClientAdded={fetchClients} />
        </div>

        <h3>Client List</h3>
        <div className="client-list">
          {clients.map((client) => (
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
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                  {client.patients.map((patient) => (
                    <li key={patient.id}>
                      {patient.name} ({patient.species}) - {patient.sex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default App;