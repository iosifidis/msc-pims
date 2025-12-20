import { useState } from 'react';
import axios from 'axios';

const ClientForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    patients: [
      { name: '', species: 'DOG', sex: 'MALE' }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePatientChange = (e, index) => {
    const { name, value } = e.target;
    const updatedPatients = [...formData.patients];
    updatedPatients[index] = {
      ...updatedPatients[index],
      [name]: value
    };
    setFormData(prevState => ({
      ...prevState,
      patients: updatedPatients
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/clients', formData);
      console.log('Success:', response.data);
      alert('Client and Patient created successfully!');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        patients: [
          { name: '', species: 'DOG', sex: 'MALE' }
        ]
      });
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. See console for details.');
    }
  };

  return (
    <div className="client-form-container">
      <h2>Create New Client & Patient</h2>
      <form onSubmit={handleSubmit} className="client-form">
        <div className="form-section">
          <h3>Client Details</h3>
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Patient Details</h3>
          {formData.patients.map((patient, index) => (
            <div key={index} className="patient-inputs">
              <div className="form-group">
                <label htmlFor={`patient-name-${index}`}>Name:</label>
                <input
                  type="text"
                  id={`patient-name-${index}`}
                  name="name"
                  value={patient.name}
                  onChange={(e) => handlePatientChange(e, index)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`patient-species-${index}`}>Species:</label>
                <select
                  id={`patient-species-${index}`}
                  name="species"
                  value={patient.species}
                  onChange={(e) => handlePatientChange(e, index)}
                >
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={`patient-sex-${index}`}>Sex:</label>
                <select
                  id={`patient-sex-${index}`}
                  name="sex"
                  value={patient.sex}
                  onChange={(e) => handlePatientChange(e, index)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-btn">Create Client</button>
      </form>
    </div>
  );
};

export default ClientForm;
