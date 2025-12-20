import React, { useState } from 'react';
import axios from 'axios';

const AppointmentForm = ({ onAppointmentAdded }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    patientId: '',
    vetId: '',
    resourceId: '',
    startTime: '',
    endTime: '',
    notes: '',
    type: 'EXAM' // Default value
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      alert("Start time must be before end time.");
      return;
    }

    // Construct payload matching Backend DTO structure (AppointmentRequest)
    const payload = {
      clientId: parseInt(formData.clientId),
      patientId: parseInt(formData.patientId),
      vetId: parseInt(formData.vetId),
      resourceId: parseInt(formData.resourceId),
      startTime: formData.startTime, // datetime-local format (YYYY-MM-DDTHH:mm)
      endTime: formData.endTime,
      notes: formData.notes,
      type: formData.type
    };

    try {
      await axios.post('http://localhost:8080/api/appointments', payload);
      alert('Appointment booked successfully!');
      
      // Reset form
      setFormData({
        clientId: '',
        patientId: '',
        vetId: '',
        resourceId: '',
        startTime: '',
        endTime: '',
        notes: '',
        type: 'EXAM'
      });

      // Notify parent to refresh calendar
      if (onAppointmentAdded) {
        onAppointmentAdded();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error.response?.data?.message || "Failed to book appointment. Vet or Resource might be busy.";
      alert(errorMessage);
    }
  };

  return (
    <div className="appointment-form-container" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h3>Book New Appointment</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Client ID:</label>
            <input
              type="number"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Patient ID:</label>
            <input
              type="number"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Vet ID:</label>
            <input
              type="number"
              name="vetId"
              value={formData.vetId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Resource ID:</label>
            <input
              type="number"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Appointment Type:</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="EXAM">Exam</option>
              <option value="OTHER">Other</option>
              <option value="DENTAL">Dental</option>
              <option value="SURGERY">Surgery</option>
              <option value="VACCINE">Vaccine</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Start Time:</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>End Time:</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Notes:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: '10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
