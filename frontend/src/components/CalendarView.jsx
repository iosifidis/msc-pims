import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MedicalRecordForm from './MedicalRecordForm';
import PatientHistory from './PatientHistory';
import InvoiceForm from './InvoiceForm';

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

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/appointments');
      const appointments = response.data.map(appointment => ({
        title: `${appointment.patient?.name || 'Unknown'} - ${appointment.client?.lastName || 'Unknown'}`,
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
        resource: appointment
      }));
      setEvents(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowHistory(false);
  };

  const handleDeleteAppointment = async () => {
    if (!selectedEvent) return;

    const confirmDelete = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmDelete) return;

    try {
      const appointmentId = selectedEvent.resource.id;
      await axios.delete(`http://localhost:8080/api/appointments/${appointmentId}`);
      
      // Remove from state
      setEvents(events.filter(e => e.resource.id !== appointmentId));
      handleCloseModal();
      alert("Appointment cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment.");
    }
  };

  return (
    <div style={{ height: '500px', margin: '20px', position: 'relative' }}>
      <h2>Appointments Calendar</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
      />

      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3>Appointment Details</h3>
            <p><strong>Date:</strong> {format(selectedEvent.start, 'PPP')}</p>
            <p><strong>Time:</strong> {format(selectedEvent.start, 'p')} - {format(selectedEvent.end, 'p')}</p>
            <p><strong>Client:</strong> {selectedEvent.resource.client?.firstName} {selectedEvent.resource.client?.lastName}</p>
            <p><strong>Patient:</strong> {selectedEvent.resource.patient?.name} ({selectedEvent.resource.patient?.species})</p>
            <p><strong>Vet:</strong> {selectedEvent.resource.vet?.firstName} {selectedEvent.resource.vet?.lastName}</p>
            <p><strong>Type:</strong> {selectedEvent.resource.type}</p>
            <p><strong>Notes:</strong> {selectedEvent.resource.notes || 'N/A'}</p>
            
            <hr style={{ margin: '20px 0' }} />
            <MedicalRecordForm appointmentId={selectedEvent.resource.id} />
            
            <InvoiceForm appointmentId={selectedEvent.resource.id} />

            {showHistory && (
              <>
                <hr style={{ margin: '20px 0' }} />
                <PatientHistory patientId={selectedEvent.resource.patient?.id} />
              </>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
              <button 
                onClick={handleCloseModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button 
                onClick={handleDeleteAppointment}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
