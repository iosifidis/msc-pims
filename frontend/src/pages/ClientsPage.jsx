import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MedicalRecordModal from '../components/MedicalRecordModal';

const ClientsPage = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClientModal, setShowClientModal] = useState(false);
    const [showPetModal, setShowPetModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

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

    const openCreateClientModal = () => {
        setSelectedClient(null);
        setShowClientModal(true);
    };

    const openEditClientModal = (client) => {
        setSelectedClient(client);
        setShowClientModal(true);
    };

    const openPetManagerModal = (client) => {
        setSelectedClient(client);
        setShowPetModal(true);
    };

    const openHistoryModal = (client) => {
        setSelectedClient(client);
        setShowHistoryModal(true);
    };

    const closeModals = () => {
        setShowClientModal(false);
        setShowPetModal(false);
        setShowHistoryModal(false);
        setSelectedClient(null);
    };

    const handleSaveClient = () => {
        fetchClients();
        closeModals();
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pet owner?')) return;
        
        try {
            await axios.delete(`http://localhost:8080/api/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete pet owner');
        }
    };

    const filteredClients = clients.filter(client => {
        const term = searchTerm.toLowerCase();
        
        return (
            client.firstName?.toLowerCase().includes(term) ||
            client.lastName?.toLowerCase().includes(term) ||
            client.email?.toLowerCase().includes(term) ||
            client.phoneNumber?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900">Pet Owners</h1>
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        placeholder="Search owners..." 
                        className="border border-gray-300 rounded-md px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        onClick={openCreateClientModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors"
                    >
                        + Add Owner
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
                                    Owner
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pets Count
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
                                        {searchTerm ? 'No pet owners found' : 'No pet owners yet'}
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
                                            <div className="text-sm font-semibold text-gray-700">
                                                {client.pets ? client.pets.length : 0} {(client.pets?.length === 1) ? 'pet' : 'pets'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => openEditClientModal(client)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-semibold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openPetManagerModal(client)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md font-semibold transition-colors"
                                                >
                                                    Pets
                                                </button>
                                                <button
                                                    onClick={() => openHistoryModal(client)}
                                                    className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded-md font-semibold transition-colors"
                                                >
                                                    Visits
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-semibold transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modals */}
            {showClientModal && (
                <ClientModal
                    client={selectedClient}
                    onClose={closeModals}
                    onSave={handleSaveClient}
                    token={token}
                />
            )}

            {showPetModal && (
                <PetManagerModal
                    client={selectedClient}
                    onClose={closeModals}
                    token={token}
                />
            )}

            {showHistoryModal && (
                <HistoryModal
                    client={selectedClient}
                    onClose={closeModals}
                    token={token}
                />
            )}
        </div>
    );
};

// ============================================
// CLIENT MODAL - Owner Details Only
// ============================================
const ClientModal = ({ client, onClose, onSave, token }) => {
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

    useEffect(() => {
        if (client) {
            setFormData({
                firstName: client.firstName || '',
                lastName: client.lastName || '',
                email: client.email || '',
                phoneNumber: client.phoneNumber || '',
                address: client.address || '',
                afm: client.afm || '',
                adt: client.adt || ''
            });
        }
    }, [client]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (client) {
                await axios.put(
                    `http://localhost:8080/api/clients/${client.id}`,
                    formData,
                    config
                );
            } else {
                await axios.post('http://localhost:8080/api/clients', formData, config);
            }
            
            onSave();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Failed to save pet owner');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between sticky top-0">
                    <h3 className="text-xl font-bold text-gray-900">
                        {client ? 'Edit Pet Owner' : 'Add Pet Owner'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
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
                            {saving ? 'Saving...' : 'Save Owner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// PET MANAGER MODAL
// ============================================
const PetManagerModal = ({ client, onClose, token }) => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPet, setNewPet] = useState({
        name: '',
        species: '',
        breed: '',
        sex: '',
        microchip: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPets();
    }, [client?.id]);

    const fetchPets = async () => {
        if (!client?.id) return;
        
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/patients/owner/${client.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setPets(response.data || []);
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePetChange = (e) => {
        setNewPet({ ...newPet, [e.target.name]: e.target.value });
    };

    const handleAddPet = async (e) => {
        e.preventDefault();
        
        if (!newPet.name || !newPet.species) {
            alert('Please provide at least Pet Name and Species');
            return;
        }

        setSaving(true);
        try {
            await axios.post(
                `http://localhost:8080/api/clients/${client.id}/pets`,
                newPet,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setNewPet({
                name: '',
                species: '',
                breed: '',
                sex: '',
                microchip: ''
            });
            
            await fetchPets();
            alert('Pet added successfully!');
        } catch (error) {
            console.error('Error adding pet:', error);
            alert('Failed to add pet');
        } finally {
            setSaving(false);
        }
    };

    const handleMarkDeceased = async (petId) => {
        if (!window.confirm('Mark this pet as deceased?')) return;

        try {
            await axios.put(
                `http://localhost:8080/api/patients/${petId}/status`,
                { isDeceased: true },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            await fetchPets();
        } catch (error) {
            console.error('Error updating pet status:', error);
            alert('Failed to update pet status');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 bg-green-50 border-b border-green-200 flex items-center justify-between sticky top-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            🐾 Pet Manager
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {client?.firstName} {client?.lastName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6">
                    {/* Add New Pet Form */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Pet</h4>
                        <form onSubmit={handleAddPet}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Pet Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newPet.name}
                                        onChange={handlePetChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Rex, Luna"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Species *
                                    </label>
                                    <select
                                        name="species"
                                        value={newPet.species}
                                        onChange={handlePetChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Sex
                                    </label>
                                    <select
                                        name="sex"
                                        value={newPet.sex}
                                        onChange={handlePetChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Breed
                                    </label>
                                    <input
                                        type="text"
                                        name="breed"
                                        value={newPet.breed}
                                        onChange={handlePetChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Golden Retriever"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Microchip Number
                                    </label>
                                    <input
                                        type="text"
                                        name="microchip"
                                        value={newPet.microchip}
                                        onChange={handlePetChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="15-digit number"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                            >
                                {saving ? 'Adding Pet...' : '+ Add Pet'}
                            </button>
                        </form>
                    </div>

                    {/* Pets List */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Registered Pets</h4>
                        
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading pets...</div>
                        ) : pets.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">No pets registered yet</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {pets.map((pet) => (
                                    <div
                                        key={pet.id}
                                        className={`border rounded-lg p-4 ${
                                            pet.isDeceased 
                                                ? 'bg-red-50 border-red-300 opacity-60' 
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className={`text-lg font-bold ${
                                                        pet.isDeceased ? 'text-red-700 line-through' : 'text-gray-900'
                                                    }`}>
                                                        {pet.name}
                                                    </h5>
                                                    {pet.isDeceased && (
                                                        <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded">
                                                            DECEASED
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-700 mt-2 space-y-1">
                                                    <div><strong>Species:</strong> {pet.species}</div>
                                                    {pet.breed && <div><strong>Breed:</strong> {pet.breed}</div>}
                                                    {pet.sex && <div><strong>Sex:</strong> {pet.sex}</div>}
                                                    {pet.microchip && (
                                                        <div className="text-xs text-gray-500">
                                                            Microchip: {pet.microchip}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {!pet.isDeceased && (
                                                <button
                                                    onClick={() => handleMarkDeceased(pet.id)}
                                                    className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded font-medium transition-colors ml-2"
                                                >
                                                    Mark<br/>Deceased
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// HISTORY MODAL - View Past Visits
// ============================================
const HistoryModal = ({ client, onClose, token }) => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showRecordModal, setShowRecordModal] = useState(false);

    useEffect(() => {
        fetchVisits();
    }, [client?.id]);

    const fetchVisits = async () => {
        if (!client?.id) return;
        
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/medical-records/owner/${client.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setVisits(response.data || []);
        } catch (error) {
            console.error('Error fetching visit history:', error);
        } finally {
            setLoading(false);
        }
    };

    const openRecordDetails = (record) => {
        setSelectedRecord(record);
        setShowRecordModal(true);
    };

    const closeRecordModal = () => {
        setShowRecordModal(false);
        setSelectedRecord(null);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-4 bg-purple-50 border-b border-purple-200 flex items-center justify-between sticky top-0">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                📋 Visit History
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {client?.firstName} {client?.lastName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading visit history...</div>
                        ) : visits.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No visits recorded yet</div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {visits.map((visit) => (
                                        <tr 
                                            key={visit.id} 
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(visit.visitDate || visit.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {visit.patient?.name || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {visit.assessment || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => openRecordDetails(visit)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View Details →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Record Details Modal */}
            {showRecordModal && selectedRecord && (
                <MedicalRecordModal
                    record={selectedRecord}
                    onClose={closeRecordModal}
                    onSave={() => {}}
                    readOnly={true}
                />
            )}
        </>
    );
};

export default ClientsPage;
