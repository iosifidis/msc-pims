import { useState } from 'react';
import axios from 'axios';

const ClientForm = ({ onClientAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    afm: '',
    adt: '',
    patients: [
      { 
        name: '', 
        species: 'DOG', 
        breed: '',
        sex: 'MALE',
        birthDate: '',
        microchipNumber: '',
        microchipDate: '',
        isSterilized: false,
        sterilizationDate: ''
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePatientChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const updatedPatients = [...formData.patients];
    updatedPatients[index] = {
      ...updatedPatients[index],
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(prevState => ({
      ...prevState,
      patients: updatedPatients
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare data for submission
      // Ensure dates are in correct format if needed, or just pass as string if backend handles it
      // Assuming backend accepts ISO date strings or YYYY-MM-DD
      
      const response = await axios.post('http://localhost:8080/api/clients', formData);
      
      setMessage({ type: 'success', text: 'Client and Patient registered successfully!' });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        afm: '',
        adt: '',
        patients: [
          { 
            name: '', 
            species: 'DOG', 
            breed: '',
            sex: 'MALE',
            birthDate: '',
            microchipNumber: '',
            microchipDate: '',
            isSterilized: false,
            sterilizationDate: ''
          }
        ]
      });

      if (onClientAdded) {
        onClientAdded();
      }

    } catch (error) {
      console.error('Error creating client:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to register client. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">New Client Registration</h2>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section A: Client Details */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
            Client Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AFM (Tax ID)</label>
              <input
                type="text"
                name="afm"
                value={formData.afm}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ADT (ID Card)</label>
              <input
                type="text"
                name="adt"
                value={formData.adt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. AB123456"
              />
            </div>
          </div>
        </div>

        {/* Section B: Patient Details */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
            Patient Details
          </h3>

          {formData.patients.map((patient, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                <input
                  type="text"
                  name="name"
                  value={patient.name}
                  onChange={(e) => handlePatientChange(e, index)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
                <select
                  name="species"
                  value={patient.species}
                  onChange={(e) => handlePatientChange(e, index)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="RABBIT">Rabbit</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  name="breed"
                  value={patient.breed}
                  onChange={(e) => handlePatientChange(e, index)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select
                  name="sex"
                  value={patient.sex}
                  onChange={(e) => handlePatientChange(e, index)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  value={patient.birthDate}
                  onChange={(e) => handlePatientChange(e, index)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* New Fields */}
              <div className="md:col-span-2 border-t border-blue-200 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Registry Info (EMZS)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Microchip Number</label>
                    <input
                      type="text"
                      name="microchipNumber"
                      value={patient.microchipNumber}
                      onChange={(e) => handlePatientChange(e, index)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="15-digit code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Microchip Date</label>
                    <input
                      type="date"
                      name="microchipDate"
                      value={patient.microchipDate}
                      onChange={(e) => handlePatientChange(e, index)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="isSterilized"
                      name="isSterilized"
                      checked={patient.isSterilized}
                      onChange={(e) => handlePatientChange(e, index)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isSterilized" className="ml-2 block text-sm text-gray-900">
                      Is Sterilized?
                    </label>
                  </div>

                  {patient.isSterilized && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sterilization Date</label>
                      <input
                        type="date"
                        name="sterilizationDate"
                        value={patient.sterilizationDate}
                        onChange={(e) => handlePatientChange(e, index)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Registering...' : 'Register Client & Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
