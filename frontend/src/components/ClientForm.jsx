import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ClientForm = ({ client, onSuccess, onCancel }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        afm: '',
        adt: '',
        isStrayCaretaker: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (client) {
            setFormData({
                firstName: client.firstName || '',
                lastName: client.lastName || '',
                email: client.email || '',
                phone: client.phone || client.phoneNumber || '',
                address: client.address || '',
                afm: client.afm || '',
                adt: client.adt || '',
                isStrayCaretaker: client.isStrayCaretaker || false
            });
        }
    }, [client]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Payload strictly matching backend entity
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            afm: formData.afm,
            adt: formData.adt,
            isStrayCaretaker: formData.isStrayCaretaker
            // balance is NOT sent
        };

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (client?.id) {
                await axios.put(`http://localhost:8080/api/clients/${client.id}`, payload, config);
            } else {
                await axios.post('http://localhost:8080/api/clients', payload, config);
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error saving client:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                setError(`Error: ${err.response.data?.message || 'Failed to save client'}`);
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">AFM</label>
                    <input type="text" name="afm" value={formData.afm} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ADT</label>
                    <input type="text" name="adt" value={formData.adt} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2 flex items-center">
                    <input
                        id="isStrayCaretaker"
                        name="isStrayCaretaker"
                        type="checkbox"
                        checked={formData.isStrayCaretaker}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isStrayCaretaker" className="ml-2 block text-sm text-gray-900">
                        Is Stray Animal Caretaker
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (client ? 'Update Owner' : 'Add Owner')}
                </button>
            </div>
        </form>
    );
};

export default ClientForm;