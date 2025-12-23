import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ClientsPage = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(response.data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingClient(null);
        setShowModal(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClient(null);
    };

    const handleSave = () => {
        fetchClients();
        closeModal();
    };

    // Update a specific client in local state after pet operations
    const updateClientInState = (updatedClient) => {
        setClients(clients.map(c => 
            c.id === updatedClient.id ? updatedClient : c
        ));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;
        
        try {
            await axios.delete(`http://localhost:8080/api/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete client');
        }
    };

    // Filter clients by firstName, lastName, email, phoneNumber, OR pet name
    const filteredClients = clients.filter(client => {
        const term = searchTerm.toLowerCase();
        
        const matchesClient = 
            client.firstName?.toLowerCase().includes(term) ||
            client.lastName?.toLowerCase().includes(term) ||
            client.email?.toLowerCase().includes(term) ||
            client.phoneNumber?.toLowerCase().includes(term);
        
        const matchesPet = client.pets?.some(pet => 
            pet.name?.toLowerCase().includes(term)
        );
        
        return matchesClient || matchesPet;
    });

    return (
        <div className="p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900">Clients</h1>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Search clients or pets..." 
                        className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition-colors"
                    >
                        + Add Client
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name / Address
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pets
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        {searchTerm ? 'No clients found' : 'No clients yet'}
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {client.firstName} {client.lastName}
                                            </div>
                                            {client.address && (
                                                <div className="text-sm text-gray-500 mt-1">{client.address}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{client.email}</div>
                                            {client.phoneNumber && (
                                                <div className="text-sm text-gray-500 mt-1">{client.phoneNumber}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                {client.pets && client.pets.length > 0 ? (
                                                    client.pets.map((pet, idx) => (
                                                        <span key={pet.id || idx}>
                                                            <span
                                                                className={pet.isDeceased ? 'line-through text-red-500' : ''}
                                                            >
                                                                {pet.name}
                                                            </span>
                                                            {idx < client.pets.length - 1 && ', '}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openEditModal(client)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <ClientModal
                    client={editingClient}
                    onClose={closeModal}
                    onSave={handleSave}
                    onPetUpdate={updateClientInState}
                    token={token}
                />
            )}
        </div>
    );
};

// Client Modal Component
const ClientModal = ({ client, onClose, onSave, onPetUpdate, token }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        afm: '',
        adt: ''
    });
    const [saving, setSaving] = useState(false);
    
    // For managing existing client's pets (edit mode only)
    const [pets, setPets] = useState([]);
    const [showAddPet, setShowAddPet] = useState(false);
    const [newPet, setNewPet] = useState({
        name: '',
        species: '',
        breed: '',
        sex: '',
        microchip: ''
    });
    const [savingPet, setSavingPet] = useState(false);
    const [loadingClient, setLoadingClient] = useState(false);

    // Centralized function to fetch fresh client details from backend
    const fetchClientDetails = async () => {
        if (!client?.id) return;
        
        setLoadingClient(true);
        try {
            // CRITICAL: Authorization header included
            const response = await axios.get(
                `http://localhost:8080/api/clients/${client.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            const clientData = response.data;
            
            // Update form data
            setFormData({ ...clientData });
            
            // Update pets list
            setPets(clientData.pets || []);
            
            // Update parent state
            if (onPetUpdate) {
                onPetUpdate(clientData);
            }
        } catch (error) {
            console.error('Error fetching client details:', error);
            alert('Failed to load client data');
        } finally {
            setLoadingClient(false);
        }
    };

    // Fetch fresh client data when modal opens in edit mode
    useEffect(() => {
        if (client?.id) {
            fetchClientDetails();
        } else {
            // Create mode: reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                afm: '',
                adt: ''
            });
            setPets([]);
        }
    }, [client?.id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePetChange = (e) => {
        setNewPet({ ...newPet, [e.target.name]: e.target.value });
    };

    const handleAddNewPet = async () => {
        if (!newPet.name || !newPet.species) {
            alert('Please provide at least Pet Name and Species');
            return;
        }

        setSavingPet(true);
        try {
            // 1. Post pet to DB
            await axios.post(
                `http://localhost:8080/api/clients/${client.id}/pets`,
                newPet,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // 2. Clear Pet Form
            setNewPet({
                name: '',
                species: '',
                breed: '',
                sex: '',
                microchip: ''
            });
            setShowAddPet(false);
            
            // 3. CRITICAL: Refresh the data!
            await fetchClientDetails(); // ← THIS IS THE FIX
            
            alert('Pet added successfully!');
        } catch (error) {
            console.error('Error adding pet:', error);
            alert('Failed to add pet');
        } finally {
            setSavingPet(false);
        }
    };

    const handleMarkDeceased = async (petId) => {
        if (!window.confirm('Mark this pet as deceased?')) return;

        try {
            await axios.put(
                `http://localhost:8080/api/patients/${petId}/status`,
                { isDeceased: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // CRITICAL: Refresh the data!
            await fetchClientDetails();
            
            alert('Pet marked as deceased');
        } catch (error) {
            console.error('Error updating pet status:', error);
            alert('Failed to update pet status');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (client) {
                // Edit mode: only update client data
                const clientData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    afm: formData.afm,
                    adt: formData.adt
                };
                await axios.put(`http://localhost:8080/api/clients/${client.id}`, clientData, config);
            } else {
                // Create mode: only create client (no pet data)
                const payload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    afm: formData.afm,
                    adt: formData.adt
                };
                
                await axios.post('http://localhost:8080/api/clients', payload, config);
            }
            
            onSave();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Failed to save client');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between sticky top-0">
                    <h3 className="text-xl font-bold text-gray-900">
                        {client ? 'Edit Client' : 'Add Client'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Client Information Section */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    AFM (Tax ID)
                                </label>
                                <input
                                    type="text"
                                    name="afm"
                                    value={formData.afm}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ADT (ID Card)
                                </label>
                                <input
                                    type="text"
                                    name="adt"
                                    value={formData.adt}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Registered Pets Section - Only show when editing existing client */}
                    {client && (
                        <>
                            <div className="border-t border-gray-200 my-6"></div>
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Registered Pets</h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddPet(!showAddPet)}
                                        className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                    >
                                        {showAddPet ? 'Cancel' : '+ Add Pet'}
                                    </button>
                                </div>

                                {/* Existing Pets List */}
                                {pets.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                        {pets.map((pet, index) => (
                                            <div
                                                key={pet.id || index}
                                                className={`border rounded-md p-3 flex items-center justify-between ${
                                                    pet.isDeceased 
                                                        ? 'bg-red-50 border-red-200' 
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <div className={`font-semibold ${
                                                        pet.isDeceased ? 'text-red-700 line-through' : 'text-gray-900'
                                                    }`}>
                                                        {pet.name}
                                                        {pet.isDeceased && (
                                                            <span className="ml-2 text-xs font-normal text-red-600">
                                                                (Deceased)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {pet.species} {pet.breed && `• ${pet.breed}`}
                                                    </div>
                                                    {pet.sex && (
                                                        <div className="text-xs text-gray-500 mt-1">{pet.sex}</div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    {pet.isDeceased ? (
                                                        <span className="text-xs text-red-600 font-medium px-3 py-1 bg-red-100 rounded">
                                                            Rest in Peace
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMarkDeceased(pet.id)}
                                                            className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
                                                        >
                                                            Mark Deceased
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mb-4">No pets registered yet</p>
                                )}

                                {/* Add New Pet Form */}
                                {showAddPet && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                                        <h5 className="text-md font-semibold text-gray-900 mb-3">New Pet Details</h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Pet Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={newPet.name}
                                                    onChange={handlePetChange}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Rex"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Species *
                                                </label>
                                                <select
                                                    name="species"
                                                    value={newPet.species}
                                                    onChange={handlePetChange}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Dog">Dog</option>
                                                    <option value="Cat">Cat</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Sex
                                                </label>
                                                <select
                                                    name="sex"
                                                    value={newPet.sex}
                                                    onChange={handlePetChange}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Breed
                                                </label>
                                                <input
                                                    type="text"
                                                    name="breed"
                                                    value={newPet.breed}
                                                    onChange={handlePetChange}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Golden Retriever"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Microchip Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="microchip"
                                                    value={newPet.microchip}
                                                    onChange={handlePetChange}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="15-digit microchip number"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddNewPet}
                                            disabled={savingPet}
                                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
                                        >
                                            {savingPet ? 'Adding Pet...' : 'Add Pet'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientsPage;
