import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar Navigation State
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({ start: null, end: null });
  
  // Form Data State
  const [clients, setClients] = useState([]);
  const [vets, setVets] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedVet, setSelectedVet] = useState(user?.id || '');
  const [appointmentType, setAppointmentType] = useState('EXAM');
  const [notes, setNotes] = useState('');
  
  // Derived State
  const availablePatients = selectedClient 
    ? clients.find(c => c.id === parseInt(selectedClient))?.patients || []
    : [];

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/appointments');
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
  }, []);

  const fetchFormData = useCallback(async () => {
    try {
      const [clientsRes, vetsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/clients'),
        axios.get('http://localhost:8080/api/users/vets').catch(() => ({ data: [] })) // Fallback if endpoint doesn't exist
      ]);
      setClients(clientsRes.data);
      setVets(vetsRes.data);
      
      // If we have vets and no selected vet, default to first one or current user
      if (vetsRes.data.length > 0 && !selectedVet) {
         // If current user is in the list, select them, otherwise first one
         const currentUserIsVet = vetsRes.data.find(v => v.id === user?.id);
         setSelectedVet(currentUserIsVet ? user.id : vetsRes.data[0].id);
      } else if (!selectedVet && user) {
          setSelectedVet(user.id);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }, [selectedVet, user]);

  useEffect(() => {
    fetchAppointments();
    fetchFormData();
  }, [fetchAppointments, fetchFormData]);

  const eventPropGetter = (event) => {
    let backgroundColor = '#3174ad'; // Default blue

    switch (event.type) {
      case 'SURGERY':
        backgroundColor = '#d32f2f'; // Red
        break;
      case 'EXAM':
        backgroundColor = '#1976d2'; // Blue
        break;
      case 'VACCINATION':
        backgroundColor = '#2e7d32'; // Green
        break;
      case 'GROOMING':
        backgroundColor = '#ed6c02'; // Orange
        break;
      default:
        backgroundColor = '#757575'; // Grey
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

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setShowModal(true);
    // Reset form fields
    setSelectedClient('');
    setSelectedPatient('');
    setAppointmentType('EXAM');
    setNotes('');
    // Keep vet as is (default or previously selected)
  };

  const handleSelectEvent = (event) => {
    alert(`
      Appointment Details:
      Patient: ${event.resource.patient?.name}
      Owner: ${event.resource.client?.firstName} ${event.resource.client?.lastName}
      Type: ${event.type}
      Time: ${event.start.toLocaleString()} - ${event.end.toLocaleString()}
      Notes: ${event.resource.notes || 'None'}
    `);
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
      await axios.post('http://localhost:8080/api/appointments', payload);
      setShowModal(false);
      fetchAppointments(); // Refresh calendar
      alert('Appointment created successfully!');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment.');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading calendar...</div>;
  }

  return (
    <div className="h-screen p-4 bg-white rounded-lg shadow relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Calendar</h2>
      <div style={{ height: 'calc(100vh - 150px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventPropGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
          date={date}
          view={view}
          onNavigate={setDate}
          onView={setView}
        />
      </div>

      {/* Create Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">New Appointment</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Time:</strong> {selectedSlot.start?.toLocaleString()} - {selectedSlot.end?.toLocaleTimeString()}
              </p>
            </div>

            <div className="space-y-4">
              {/* Client Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    setSelectedPatient(''); // Reset patient when client changes
                  }}
                  className="w-full border border-gray-300 rounded-md p-2"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  disabled={!selectedClient}
                  className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Veterinarian</label>
                <select
                  value={selectedVet}
                  onChange={(e) => setSelectedVet(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select Vet</option>
                  {vets.length > 0 ? (
                    vets.map(vet => (
                      <option key={vet.id} value={vet.id}>
                        {vet.fullName || vet.username}
                      </option>
                    ))
                  ) : (
                    // Fallback if no vets loaded but we have current user
                    user && <option value={user.id}>{user.username} (Current)</option>
                  )}
                </select>
              </div>

              {/* Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="EXAM">Exam</option>
                  <option value="SURGERY">Surgery</option>
                  <option value="VACCINATION">Vaccination</option>
                  <option value="GROOMING">Grooming</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
