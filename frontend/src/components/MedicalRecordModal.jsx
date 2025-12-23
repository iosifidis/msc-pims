import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MedicalRecordModal = ({ appointmentId, patientName, patientId, onClose }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        // Vital Signs
        weight: '',
        temperature: '',
        heartRate: '',
        respiratoryRate: '',
        mucousMembranes: '',
        crt: '',
        // SOAP Notes
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        // Financial
        cost: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [patientHistory, setPatientHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        const fetchRecord = async () => {
            if (!appointmentId) return;
            
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.get(`http://localhost:8080/api/medical-records/appointment/${appointmentId}`, config);
                
                if (response.data) {
                    setFormData({
                        weight: response.data.weight || '',
                        temperature: response.data.temperature || '',
                        heartRate: response.data.heartRate || '',
                        respiratoryRate: response.data.respiratoryRate || '',
                        mucousMembranes: response.data.mucousMembranes || '',
                        crt: response.data.crt || '',
                        subjective: response.data.subjective || '',
                        objective: response.data.objective || '',
                        assessment: response.data.assessment || '',
                        plan: response.data.plan || '',
                        cost: response.data.cost || ''
                    });
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // No record found, that's okay, we'll create one.
                } else {
                    console.error("Error fetching medical record:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchPatientHistory = async () => {
            console.log("Fetching history for Patient ID:", patientId);
            
            if (!patientId) {
                console.log("No patient ID provided, skipping history fetch");
                setHistoryLoading(false);
                return;
            }
            
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                console.log("Fetching patient history from API...");
                const response = await axios.get(`http://localhost:8080/api/medical-records/patient/${patientId}`, config);
                console.log("Patient history response:", response.data);
                setPatientHistory(response.data || []);
            } catch (error) {
                console.error("Failed to fetch history:", error);
                console.error("Error details:", error.response?.data || error.message);
            } finally {
                setHistoryLoading(false);
            }
        };

        if (token) {
            fetchRecord();
            fetchPatientHistory();
        } else {
            setLoading(false);
            setHistoryLoading(false);
        }
    }, [appointmentId, patientId, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const payload = {
                appointmentId,
                ...formData
            };
            
            console.log("Saving medical record with vitals:", payload);
            await axios.post('http://localhost:8080/api/medical-records', payload, config);
            alert('Medical record saved successfully!');
            onClose();
        } catch (error) {
            console.error("Error saving medical record:", error);
            alert("Failed to save medical record.");
        } finally {
            setSaving(false);
        }
    };

    const overlayStyle = {
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

    const contentStyle = {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '700px',
        maxWidth: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    };

    const titleStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: 0
    };

    const closeButtonStyle = {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#6b7280',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        lineHeight: '1'
    };

    const patientInfoStyle = {
        marginBottom: '20px',
        color: '#374151'
    };

    const sectionTitleStyle = {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '12px',
        marginTop: '20px'
    };

    const vitalsContainerStyle = {
        backgroundColor: '#eff6ff',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #bfdbfe'
    };

    const vitalsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
    };

    const vitalsFieldStyle = {
        display: 'flex',
        flexDirection: 'column'
    };

    const vitalsLabelStyle = {
        fontSize: '12px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '4px'
    };

    const vitalsInputStyle = {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        padding: '6px 8px',
        fontSize: '13px',
        boxSizing: 'border-box'
    };

    const fieldContainerStyle = {
        marginBottom: '16px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '4px'
    };

    const textareaStyle = {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box'
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
        cursor: saving ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };

    const saveButtonStyle = {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: (saving || loading) ? '#93c5fd' : '#2563eb',
        color: 'white',
        cursor: (saving || loading) ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };

    const dividerStyle = {
        margin: '24px 0',
        border: 'none',
        borderTop: '1px solid #e5e7eb'
    };

    const historyTitleStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '16px'
    };

    const historyContainerStyle = {
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '20px'
    };

    const historyCardStyle = {
        backgroundColor: '#f3f4f6',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '12px',
        border: '1px solid #e5e7eb'
    };

    const historyDateStyle = {
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: '8px'
    };

    const historyFieldStyle = {
        fontSize: '13px',
        color: '#374151',
        marginBottom: '6px'
    };

    const historyLabelStyle = {
        fontWeight: '600',
        color: '#4b5563'
    };

    const historyVitalsStyle = {
        backgroundColor: '#e0f2fe',
        padding: '8px',
        borderRadius: '4px',
        marginBottom: '8px',
        fontSize: '12px',
        color: '#0c4a6e'
    };

    return (
        <div style={overlayStyle}>
            <div style={contentStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>Medical Record (SOAP)</h2>
                    <button onClick={onClose} style={closeButtonStyle}>
                        &times;
                    </button>
                </div>

                <div style={patientInfoStyle}>
                    <p style={{ margin: 0 }}>
                        Patient: <span style={{ fontWeight: '600' }}>{patientName}</span>
                        {patientId && <span style={{ color: '#6b7280', marginLeft: '8px' }}>ID: {patientId}</span>}
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>Loading record...</div>
                ) : (
                    <div>
                        {/* Vital Signs Section */}
                        <div style={sectionTitleStyle}>Vital Signs</div>
                        <div style={vitalsContainerStyle}>
                            <div style={vitalsGridStyle}>
                                <div style={vitalsFieldStyle}>
                                    <label style={vitalsLabelStyle}>Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        style={vitalsInputStyle}
                                        placeholder="0.0"
                                        step="0.1"
                                    />
                                </div>
                                <div style={vitalsFieldStyle}>
                                    <label style={vitalsLabelStyle}>Temp (°C)</label>
                                    <input
                                        type="number"
                                        name="temperature"
                                        value={formData.temperature}
                                        onChange={handleChange}
                                        style={vitalsInputStyle}
                                        placeholder="0.0"
                                        step="0.1"
                                    />
                                </div>
                                <div style={vitalsFieldStyle}>
                                    <label style={vitalsLabelStyle}>Heart Rate (bpm)</label>
                                    <input
                                        type="number"
                                        name="heartRate"
                                        value={formData.heartRate}
                                        onChange={handleChange}
                                        style={vitalsInputStyle}
                                        placeholder="0"
                                    />
                                </div>
                                <div style={vitalsFieldStyle}>
                                    <label style={vitalsLabelStyle}>Resp. Rate (bpm)</label>
                                    <input
                                        type="number"
                                        name="respiratoryRate"
                                        value={formData.respiratoryRate}
                                        onChange={handleChange}
                                        style={vitalsInputStyle}
                                        placeholder="0"
                                    />
                                </div>
                                <div style={vitalsFieldStyle}>
                                    <label style={vitalsLabelStyle}>Mucous Memb.</label>
                                    <input
                                        type="text"
                                        name="mucousMembranes"
                                        value={formData.mucousMembranes}
                                        onChange={handleChange}
                                        style={vitalsInputStyle}
                                        placeholder="Pink, moist"
                                    />
                                </div>
                                <div style={vitalsFieldStyle}>
                                    <label style={vitalsLabelStyle}>CRT (sec)</label>
                                    <input
                                        type="number"
                                        name="crt"
                                        value={formData.crt}
                                        onChange={handleChange}
                                        style={vitalsInputStyle}
                                        placeholder="0.0"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SOAP Notes Section */}
                        <div style={sectionTitleStyle}>Clinical Notes</div>
                        
                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>
                                Subjective (History/Symptoms)
                            </label>
                            <textarea
                                name="subjective"
                                value={formData.subjective}
                                onChange={handleChange}
                                rows="3"
                                style={textareaStyle}
                                placeholder="Patient history, symptoms, complaints..."
                            />
                        </div>

                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>
                                Objective / Exam Findings
                            </label>
                            <textarea
                                name="objective"
                                value={formData.objective}
                                onChange={handleChange}
                                rows="3"
                                style={textareaStyle}
                                placeholder="Physical exam findings, lab results..."
                            />
                        </div>

                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>
                                Assessment (Diagnosis)
                            </label>
                            <textarea
                                name="assessment"
                                value={formData.assessment}
                                onChange={handleChange}
                                rows="3"
                                style={textareaStyle}
                                placeholder="Diagnosis, differential diagnosis..."
                            />
                        </div>

                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>
                                Plan (Treatment)
                            </label>
                            <textarea
                                name="plan"
                                value={formData.plan}
                                onChange={handleChange}
                                rows="3"
                                style={textareaStyle}
                                placeholder="Treatment plan, medications, follow-up..."
                            />
                        </div>

                        {/* Financial Section */}
                        <div style={sectionTitleStyle}>Financial</div>
                        <div style={fieldContainerStyle}>
                            <label style={labelStyle}>Visit Cost (€)</label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                style={{
                                    ...vitalsInputStyle,
                                    height: '40px',
                                    fontSize: '14px'
                                }}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>
                )}

                <hr style={dividerStyle} />

                <div>
                    <h3 style={historyTitleStyle}>Patient History</h3>
                    {!patientId ? (
                        <div style={{ textAlign: 'center', padding: '16px 0', color: '#ef4444' }}>No patient ID provided</div>
                    ) : historyLoading ? (
                        <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b7280' }}>Loading history...</div>
                    ) : patientHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af' }}>No previous records found</div>
                    ) : (
                        <div style={historyContainerStyle}>
                            {patientHistory.map((record, index) => (
                                <div key={record.id || index} style={historyCardStyle}>
                                    <div style={historyDateStyle}>
                                        {record.appointment?.appointmentDate 
                                            ? new Date(record.appointment.appointmentDate).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })
                                            : 'Date not available'}
                                    </div>
                                    
                                    {/* Display Vitals if Available */}
                                    {(record.weight || record.temperature || record.heartRate) && (
                                        <div style={historyVitalsStyle}>
                                            <strong>Vitals:</strong> {' '}
                                            {record.weight && `Weight: ${record.weight}kg `}
                                            {record.temperature && `| Temp: ${record.temperature}°C `}
                                            {record.heartRate && `| HR: ${record.heartRate}bpm `}
                                            {record.respiratoryRate && `| RR: ${record.respiratoryRate}bpm`}
                                        </div>
                                    )}
                                    
                                    {record.assessment && (
                                        <div style={historyFieldStyle}>
                                            <span style={historyLabelStyle}>Assessment:</span> {record.assessment}
                                        </div>
                                    )}
                                    {record.plan && (
                                        <div style={historyFieldStyle}>
                                            <span style={historyLabelStyle}>Plan:</span> {record.plan}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={buttonContainerStyle}>
                    <button
                        onClick={onClose}
                        style={cancelButtonStyle}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={saveButtonStyle}
                        disabled={saving || loading}
                    >
                        {saving ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordModal;
