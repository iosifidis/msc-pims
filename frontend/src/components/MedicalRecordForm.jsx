import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MedicalRecordForm = ({ appointmentId, onSave }) => {
  const [formData, setFormData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  useEffect(() => {
    if (!appointmentId) return;

    const fetchRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/medical-records/appointment/${appointmentId}`);
        if (response.data) {
          setFormData({
            subjective: response.data.subjective || '',
            objective: response.data.objective || '',
            assessment: response.data.assessment || '',
            plan: response.data.plan || ''
          });
        }
      } catch (error) {
        // If 404, it means no record exists yet, which is fine.
        if (error.response && error.response.status === 404) {
          setFormData({
            subjective: '',
            objective: '',
            assessment: '',
            plan: ''
          });
        } else {
          console.error("Error fetching medical record:", error);
        }
      }
    };

    fetchRecord();
  }, [appointmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/medical-records', {
        appointmentId,
        ...formData
      });
      alert('Saved successfully');
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving medical record:", error);
      alert("Failed to save medical record.");
    }
  };

  return (
    <div className="medical-record-form" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h3>Medical Record (SOAP)</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="subjective" style={{ fontWeight: 'bold' }}>Subjective (History/Symptoms):</label>
          <textarea
            id="subjective"
            name="subjective"
            value={formData.subjective}
            onChange={handleChange}
            rows="3"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Client's description of the problem..."
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="objective" style={{ fontWeight: 'bold' }}>Objective (Exam Findings/Vitals):</label>
          <textarea
            id="objective"
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            rows="3"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Physical exam findings, temperature, weight, etc..."
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="assessment" style={{ fontWeight: 'bold' }}>Assessment (Diagnosis):</label>
          <textarea
            id="assessment"
            name="assessment"
            value={formData.assessment}
            onChange={handleChange}
            rows="3"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Tentative or definitive diagnosis..."
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="plan" style={{ fontWeight: 'bold' }}>Plan (Treatment/Follow-up):</label>
          <textarea
            id="plan"
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            rows="3"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Medications, procedures, follow-up instructions..."
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            alignSelf: 'flex-start'
          }}
        >
          Save Medical Record
        </button>
      </form>
    </div>
  );
};

export default MedicalRecordForm;
