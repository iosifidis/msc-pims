import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceForm = ({ appointmentId }) => {
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('UNPAID');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    
    // Reset state when appointmentId changes
    setExistingInvoice(null);
    setAmount('');
    setStatus('UNPAID');
    
    fetchInvoice();
  }, [appointmentId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/invoices/appointment/${appointmentId}`);
      if (response.data) {
        setExistingInvoice(response.data);
      }
    } catch (error) {
      // 404 means no invoice exists yet
      if (error.response && error.response.status !== 404) {
        console.error("Error fetching invoice:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        appointmentId,
        amount: parseFloat(amount),
        status,
        issueDate: new Date().toISOString()
      };
      const response = await axios.post('http://localhost:8080/api/invoices', payload);
      setExistingInvoice(response.data);
      alert('Invoice generated successfully!');
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice.");
    }
  };

  if (loading) return <div>Loading invoice status...</div>;

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h3>Billing & Invoice</h3>
      {existingInvoice ? (
        <div>
          <p><strong>Invoice #:</strong> {existingInvoice.id}</p>
          <p><strong>Amount:</strong> {existingInvoice.amount}€</p>
          <p><strong>Status:</strong> <span style={{ color: existingInvoice.status === 'PAID' ? 'green' : 'red', fontWeight: 'bold' }}>{existingInvoice.status}</span></p>
          <p><strong>Date:</strong> {existingInvoice.issueDate ? new Date(existingInvoice.issueDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Amount (€):</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
          <button 
            type="submit" 
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              height: '30px'
            }}
          >
            Generate Invoice
          </button>
        </form>
      )}
    </div>
  );
};

export default InvoiceForm;
