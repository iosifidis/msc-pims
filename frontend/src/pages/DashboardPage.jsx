import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { isToday, isThisWeek } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MedicalRecordModal from '../components/MedicalRecordModal';

// ============================================
// CONSTANTS & HELPERS
// ============================================
const APPOINTMENT_TYPES = [
    { value: 'EXAM', label: 'Exam', color: '#3b82f6' },
    { value: 'SURGERY', label: 'Surgery', color: '#ef4444' },
    { value: 'VACCINATION', label: 'Vaccination', color: '#e11d48' },
    { value: 'GROOMING', label: 'Grooming', color: '#f97316' },
    { value: 'CHECKUP', label: 'Check-up', color: '#a855f7' },
    { value: 'EMERGENCY', label: 'Emergency', color: '#dc2626' },
];

// Helper to preserve local time in ISO string
const toLocalISOString = (date) => {
    if (!date) return null;
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 19);
};

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats State
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0,
    totalRevenue: 0
  });
  
  // Create Appointment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({ start: null, end: null });
  
  // Form Data State
  const [clients, setClients] = useState([]);
  const [vets, setVets] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedVet, setSelectedVet] = useState(user?.id || '');
  const [appointmentType, setAppointmentType] = useState('EXAM');
  const [notes, setNotes] = useState('');

  // Medical Record Modal State
  const [selectedEventForRecord, setSelectedEventForRecord] = useState(null);
  
  // Derived State
  const availablePatients = selectedClient 
    ? clients.find(c => c.id === parseInt(selectedClient))?.patients || []
    : [];

  // ============================================
  // DATA FETCHING
  // ============================================
  const fetchAppointments = useCallback(async () => {
    // Robust User Check: If user isn't ready, don't fetch, but don't crash.
    if (!user) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:8080/api/appointments', config);
      
      // Safe Filtering Logic: Check appt.vet exists before accessing .id
      const filteredAppointments = response.data.filter(appt => {
          const vetId = appt.vet?.id;
          const userId = user?.id;
          return vetId && userId && String(vetId) === String(userId);
      });

      const formattedEvents = filteredAppointments.map(appt => {
        // Color Logic matching AppointmentsPage
        let backgroundColor = '#3b82f6'; // Default Blue
        let borderColor = '#3b82f6';

        if (appt.status === 'COMPLETED') {
            backgroundColor = '#16a34a'; // Green
            borderColor = '#16a34a';
        } else {
             const typeConfig = APPOINTMENT_TYPES.find(t => t.value === appt.type);
             if (typeConfig) {
                 backgroundColor = typeConfig.color;
                 borderColor = typeConfig.color;
             }
        }

        return {
            id: appt.id,
            title: `[${appt.type}] ${appt.patient?.name || 'Unknown'} (${appt.client?.lastName || 'Unknown'})`,
            start: toLocalISOString(new Date(appt.startTime)),
            end: toLocalISOString(new Date(appt.endTime)),
            allDay: false,
            backgroundColor,
            borderColor,
            extendedProps: {
                client: appt.client,
                patient: appt.patient,
                vet: appt.vet,
                type: appt.type,
                status: appt.status,
                notes: appt.notes
            }
        };
      });
      
      setEvents(formattedEvents);
      
      // Calculate stats based on filtered events
      const todayCount = formattedEvents.filter(event => 
        isToday(new Date(event.start))
      ).length;
      
      const weekCount = formattedEvents.filter(event => 
        isThisWeek(new Date(event.start), { weekStartsOn: 1 })
      ).length;
      
      setStats(prev => ({
        ...prev,
        todayAppointments: todayCount,
        weekAppointments: weekCount
      }));
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:8080/api/dashboard/stats', config);
      
      setStats(prev => ({
        ...prev,
        totalPatients: response.data.totalPatients || 0,
        totalRevenue: response.data.revenue || 0
      }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, [token]);

  const fetchFormData = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const [clientsRes, vetsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/clients', config),
        axios.get('http://localhost:8080/api/users/vets', config).catch(() => ({ data: [] }))
      ]);
      setClients(clientsRes.data);
      setVets(vetsRes.data);
      
      if (vetsRes.data.length > 0 && !selectedVet) {
         const currentUserIsVet = vetsRes.data.find(v => String(v.id) === String(user?.id));
         setSelectedVet(currentUserIsVet ? user.id : vetsRes.data[0].id);
      } else if (!selectedVet && user) {
          setSelectedVet(user.id);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }, [selectedVet, user, token]);

  useEffect(() => {
    if (token && user) {
        fetchAppointments();
        fetchDashboardStats();
        fetchFormData();
    }
  }, [fetchAppointments, fetchDashboardStats, fetchFormData, token, user]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleDateSelect = (selectInfo) => {
    setSelectedSlot({ start: selectInfo.start, end: selectInfo.end });
    setShowCreateModal(true);
    setSelectedClient('');
    setSelectedPatient('');
    setAppointmentType('EXAM');
    setNotes('');
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    // Map FullCalendar event props back to resource structure for modal
    const resource = {
        id: event.id,
        ...event.extendedProps
    };
    setSelectedEventForRecord(resource);
  };

  const handleSaveAppointment = async () => {
    if (!selectedClient || !selectedPatient || !selectedVet) {
      alert('Please select Client, Patient and Vet');
      return;
    }

    const payload = {
      clientId: parseInt(selectedClient),
      patientId: parseInt(selectedPatient),
      vetId: parseInt(selectedVet),
      startTime: selectedSlot.start.toISOString(),
      endTime: selectedSlot.end.toISOString(),
      type: appointmentType,
      notes: notes
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post('http://localhost:8080/api/appointments', payload, config);
      setShowCreateModal(false);
      fetchAppointments();
      fetchDashboardStats();
      alert('Appointment created successfully!');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // ============================================
  // STYLES
  // ============================================
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    width: '450px',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  };

  const fieldStyle = { marginBottom: '16px' };
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' };
  const inputStyle = { width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', fontSize: '14px' };
  const disabledInputStyle = { ...inputStyle, backgroundColor: '#f3f4f6', cursor: 'not-allowed' };
  const buttonContainerStyle = { marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' };
  const cancelButtonStyle = { padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
  const saveButtonStyle = { padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Week's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.weekAppointments}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
            </div>
            <div className="text-4xl">🐾</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Schedule</h2>
        <div style={{ height: '600px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            height="100%"
            eventDisplay="block"
            nowIndicator={true}
          />
        </div>
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              New Appointment
            </h3>
            
            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
              <p style={{ margin: 0 }}>
                <strong>Time:</strong> {selectedSlot.start?.toLocaleString()} - {selectedSlot.end?.toLocaleTimeString()}
              </p>
            </div>

            <div>
              {/* Client Select */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    setSelectedPatient('');
                  }}
                  style={inputStyle}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.lastName} {client.firstName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Select */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  disabled={!selectedClient}
                  style={!selectedClient ? disabledInputStyle : inputStyle}
                >
                  <option value="">Select Patient</option>
                  {availablePatients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.species})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vet Select */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Veterinarian</label>
                <select
                  value={selectedVet}
                  onChange={(e) => setSelectedVet(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Vet</option>
                  {vets.length > 0 ? (
                    vets.map(vet => (
                      <option key={vet.id} value={vet.id}>
                        {vet.fullName || vet.username}
                      </option>
                    ))
                  ) : (
                    user && <option value={user.id}>{user.username} (Current)</option>
                  )}
                </select>
              </div>

              {/* Type Select */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="EXAM">Exam</option>
                  <option value="SURGERY">Surgery</option>
                  <option value="VACCINATION">Vaccination</option>
                  <option value="GROOMING">Grooming</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div style={buttonContainerStyle}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAppointment}
                style={saveButtonStyle}
              >
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Record Modal */}
      {selectedEventForRecord && (
        <MedicalRecordModal
          appointmentId={selectedEventForRecord.id}
          patientId={selectedEventForRecord.patient?.id}
          patientName={selectedEventForRecord.patient?.name || 'Unknown Patient'}
          onClose={() => setSelectedEventForRecord(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
