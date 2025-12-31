import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ClientSearchDropdown from './ClientSearchDropdown';

const AppointmentForm = ({ onAppointmentAdded }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    clientId: '',
    patientId: '',
    vetId: '',
    resourceId: '',
    startTime: '',
    endTime: '',
    notes: '',
    type: 'EXAM'
  });

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPets, setClientPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Fetch initial data (Clients, Vets, Resources)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [clientsRes, vetsRes, resourcesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/clients', config),
          axios.get('http://localhost:8080/api/users/vets', config),
          axios.get('http://localhost:8080/api/resources', config)
        ]);

        setClients(clientsRes.data || []);
        // Safely handle vet response - it might be wrapped or plain list
        setVets(vetsRes.data || []);
        setResources(resourcesRes.data || []);
      } catch (error) {
        console.error("Error fetching initial data for appointment form:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token]);

  // When client changes, update state and available pets
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientId: client ? client.id : '',
      patientId: '' // Reset patient when client changes
    }));

    if (client) {
      setClientPets(client.pets || []);
    } else {
      setClientPets([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientId || !formData.patientId || !formData.vetId || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      alert("Start time must be before end time.");
      return;
    }

    // Construct payload matching Backend DTO structure
    const payload = {
      clientId: parseInt(formData.clientId),
      patientId: parseInt(formData.patientId),
      vetId: parseInt(formData.vetId),
      resourceId: formData.resourceId ? parseInt(formData.resourceId) : null,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes,
      type: formData.type
    };

    try {
      await axios.post('http://localhost:8080/api/appointments', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appointment booked successfully!');

      // Reset form (keep Vet/Resource maybe? No, complete reset is safer)
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
      setSelectedClient(null);
      setClientPets([]);

      // Notify parent to refresh calendar
      if (onAppointmentAdded) {
        onAppointmentAdded();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to book appointment.";
      if (errorMessage.includes("locked")) {
        alert("Failed: " + errorMessage);
      } else {
        alert("Failed to book appointment. Please check availability.");
      }
    }
  };

  if (loadingInitial) {
    return <div className="p-4 text-center text-gray-500">Loading form data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Book New Appointment</h3>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Row 1: Client & Patient */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Owner *</label>
            <ClientSearchDropdown
              clients={clients}
              selectedClient={selectedClient}
              onSelect={handleClientSelect}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patient (Pet) *</label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              disabled={!selectedClient}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{selectedClient ? 'Select Pet' : 'Select Owner First'}</option>
              {clientPets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Vet & Resource */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Veterinarian *</label>
            <select
              name="vetId"
              value={formData.vetId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Vet</option>
              {vets.map(vet => (
                <option key={vet.id} value={vet.id}>
                  {vet.firstName} {vet.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room / Resource</label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None / General</option>
              {resources.map(res => (
                <option key={res.id} value={res.id}>
                  {res.name} ({res.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Type & Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXAM">Exam</option>
              <option value="VACCINE">Vaccine</option>
              <option value="SURGERY">Surgery</option>
              <option value="DENTAL">Dental</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Time *</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 4: Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional detailed notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition-colors duration-200"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
