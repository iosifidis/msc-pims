import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';
import MedicalRecordModal from '../components/MedicalRecordModal';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar Navigation State
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  
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

  const fetchAppointments = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:8080/api/appointments', config);
      const formattedEvents = response.data.map(appt => ({
        id: appt.id,
        title: `[${appt.type}] ${appt.patient?.name || 'Unknown'} (${appt.client?.lastName || 'Unknown'})`,
        start: new Date(appt.startTime),
        end: new Date(appt.endTime),
        resource: appt,
        type: appt.type
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
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
         const currentUserIsVet = vetsRes.data.find(v => v.id === user?.id);
         setSelectedVet(currentUserIsVet ? user.id : vetsRes.data[0].id);
      } else if (!selectedVet && user) {
          setSelectedVet(user.id);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }, [selectedVet, user, token]);

  useEffect(() => {
    if (token) {
        fetchAppointments();
        fetchFormData();
    }
  }, [fetchAppointments, fetchFormData, token]);

  const eventPropGetter = (event) => {
    let backgroundColor = '#3174ad';

    switch (event.type) {
      case 'SURGERY':
        backgroundColor = '#d32f2f';
        break;
      case 'EXAM':
        backgroundColor = '#1976d2';
        break;
      case 'VACCINATION':
        backgroundColor = '#2e7d32';
        break;
      case 'GROOMING':
        backgroundColor = '#ed6c02';
        break;
      default:
        backgroundColor = '#757575';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectSlot = (slotInfo) => {
    console.log('Slot clicked', slotInfo);
    const { start, end } = slotInfo;
    setSelectedSlot({ start, end });
    setShowCreateModal(true);
    setSelectedClient('');
    setSelectedPatient('');
    setAppointmentType('EXAM');
    setNotes('');
  };

  const handleSelectEvent = (event) => {
    console.log('Event clicked', event);
    console.log('Event resource:', event.resource);
    setSelectedEventForRecord(event.resource);
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
      alert('Appointment created successfully!');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment.');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading calendar...</div>;
  }

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

  const fieldStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  };

  const inputStyle = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '14px'
  };

  const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: '#f3f4f6',
    cursor: 'not-allowed'
  };

  const buttonContainerStyle = {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  };

  const cancelButtonStyle = {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const saveButtonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2563eb',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Calendar</h2>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventPropGetter}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable={true}
            popup
            date={date}
            view={view}
            onNavigate={setDate}
            onView={setView}
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
          patientId={selectedEventForRecord.resource?.patient?.id}
          patientName={selectedEventForRecord.resource?.patient?.name || 'Unknown Patient'}
          onClose={() => {
            console.log('Closing Medical Record Modal');
            setSelectedEventForRecord(null);
          }}
        />
      )}
    </>
  );
};

export default CalendarPage;
