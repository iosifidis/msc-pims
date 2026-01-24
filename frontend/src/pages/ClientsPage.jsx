import React, { useState, useEffect } from 'react';
import api from '../context/axiosConfig';
import { useAuth } from '../context/AuthContext';
import ClientSearchDropdown from '../components/ClientSearchDropdown';

// ============================================
// MAIN COMPONENT: ClientsPage
// ============================================
const ClientsPage = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClientModal, setShowClientModal] = useState(false);
    const [showPetModal, setShowPetModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(response.data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            // Suppress alert to prevent blocking UI. Allow empty state to render so user can Add Owner.
        } finally {
            setLoading(false);
        }
    };

    const openCreateClientModal = () => {
        setSelectedClient(null);
        setIsReadOnly(false);
        setShowClientModal(true);
    };

    const openEditClientModal = (client) => {
        setSelectedClient(client);
        setIsReadOnly(false);
        setShowClientModal(true);
    };

    const openViewClientModal = (client) => {
        setSelectedClient(client);
        setIsReadOnly(true);
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
        setIsReadOnly(false);
    };

    const handleSaveClient = () => {
        fetchClients();
        closeModals();
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pet owner? This action cannot be undone.')) return;

        try {
            await api.delete(`/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete pet owner. Please try again.');
        }
    };

    const filteredClients = clients.filter(client => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const email = client.email ? client.email.toLowerCase() : '';
        const phone = client.phoneNumber ? client.phoneNumber : '';

        // Check if ANY pet matches
        const hasMatchingPet = client.pets && client.pets.some(pet =>
            pet.name?.toLowerCase().includes(searchLower)
        );

        return (
            fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower) ||
            hasMatchingPet
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
                                    Phone
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pets Count
                                </th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        {searchTerm ? 'No pet owners found' : 'No pet owners yet'}
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div
                                                className="font-semibold text-blue-600 hover:underline cursor-pointer"
                                                onClick={() => openViewClientModal(client)}
                                            >
                                                {client.firstName} {client.lastName}
                                            </div>
                                            {client.address && (
                                                <div className="text-sm text-gray-500 mt-1">{client.address}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {client.phoneNumber || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{client.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-700">
                                                {client.petCount ?? client.pets?.length ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                <button
                                                    onClick={() => openEditClientModal(client)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openPetManagerModal(client)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
                                                >
                                                    Pets
                                                </button>
                                                <button
                                                    onClick={() => openHistoryModal(client)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
                                                >
                                                    Visits
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
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
                    readOnly={isReadOnly}
                />
            )}

            {showPetModal && (
                <PetManagerModal
                    client={selectedClient}
                    allClients={clients}
                    onClose={closeModals}
                    token={token}
                />
            )}

            {showHistoryModal && selectedClient && (
                <ClientHistoryModal
                    client={selectedClient}
                    onClose={closeModals}
                    token={token}
                />
            )}
        </div>
    );
};

// ============================================
// CLIENT MODAL - Owner Details (View/Edit/Create)
// ============================================
const ClientModal = ({ client, onClose, onSave, token, readOnly = false }) => {
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
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                afm: '',
                adt: ''
            });
        }
    }, [client]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;

        setSaving(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (client) {
                await api.put(
                    `/clients/${client.id}`,
                    formData,
                    config
                );
            } else {
                await api.post('/clients', formData, config);
            }

            onSave();
        } catch (error) {
            console.error('Error saving client:', error);
            const message = error.response?.status === 403
                ? 'Access denied. Please check your permissions.'
                : 'Failed to save pet owner. Please try again.';
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const getModalTitle = () => {
        if (readOnly) return 'View Pet Owner';
        if (client) return 'Edit Pet Owner';
        return 'Add Pet Owner';
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
                    <h3 className="text-xl font-bold text-gray-900">{getModalTitle()}</h3>
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
                                required={!readOnly}
                                disabled={readOnly}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                required={!readOnly}
                                disabled={readOnly}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                required={!readOnly}
                                disabled={readOnly}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                disabled={readOnly}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                disabled={readOnly}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                disabled={readOnly}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                disabled={readOnly}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {readOnly ? (
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
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
                    )}
                </form>
            </div>
        </div>
    );
};

// ============================================
// PET MANAGER MODAL - Full CRUD
// ============================================
const PetManagerModal = ({ client, allClients, onClose, token }) => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPetId, setEditingPetId] = useState(null);
    const [petFormData, setPetFormData] = useState({
        name: '',
        species: '',
        breed: '',
        sex: '',
        microchip: '',
        birthDate: '',
        isDateOfBirthApproximate: false
    });
    const [saving, setSaving] = useState(false);

    // Transfer Logic State
    const [transferPetId, setTransferPetId] = useState(null);
    const [targetClient, setTargetClient] = useState(null);

    const handleInitiateTransfer = (pet) => {
        setTransferPetId(pet.id);
        setTargetClient(null);
    };

    const handleConfirmTransfer = async () => {
        if (!transferPetId || !targetClient) return;

        if (!window.confirm(`Are you sure you want to transfer this pet to ${targetClient.firstName} ${targetClient.lastName}?`)) return;

        setSaving(true);
        try {
            // Try specific endpoint first, if not exists, maybe try update. 
            // Assumption: Backend supports PUT /patients/{id}/owner/{ownerId} OR standard update
            // Let's try standard REST update with ownerId first if the payload supports it, 
            // but usually owner is immutable in simple updates. 
            // Let's try a semantic URL which is likely implemented for this specific story.
            await api.put(
                `/patients/${transferPetId}/owner/${targetClient.id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Pet transferred successfully.");
            setTransferPetId(null);
            setTargetClient(null);
            await fetchPets();
            // We might want to refresh the client list in parent if counts changed, but closing modal will refresh when opened again.
        } catch (error) {
            console.error('Error transferring pet:', error);
            alert('Failed to transfer pet. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const cancelTransfer = () => {
        setTransferPetId(null);
        setTargetClient(null);
    };

    useEffect(() => {
        if (client?.id) {
            fetchPets();
        }
    }, [client?.id]);

    // Calculate age from birth date
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
            years--;
            months += 12;
        }

        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''}`;
        } else if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''}`;
        } else {
            const days = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
    };

    const fetchPets = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/patients/owner/${client.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPets(response.data || []);
        } catch (error) {
            console.error('Error fetching pets:', error);
            alert('Failed to load pets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePetFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPetFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setEditingPetId(null);
        setPetFormData({
            name: '',
            species: '',
            breed: '',
            sex: '',
            microchip: '',
            birthDate: '',
            isDateOfBirthApproximate: false
        });
    };

    const handleEditPet = (pet) => {
        setEditingPetId(pet.id);
        setPetFormData({
            name: pet.name || '',
            species: pet.species || '',
            breed: pet.breed || '',
            sex: pet.sex || '',
            microchip: pet.microchip || '',
            birthDate: pet.birthDate ? pet.birthDate.split('T')[0] : '',
            isDateOfBirthApproximate: pet.isDateOfBirthApproximate || false
        });
    };

    const handleSubmitPet = async (e) => {
        e.preventDefault();

        if (!petFormData.name || !petFormData.species) {
            alert('Please provide at least Pet Name and Species');
            return;
        }

        setSaving(true);
        try {
            // Ensure microchip is null if empty string to avoid unique constraint violations
            const payload = {
                ...petFormData,
                microchip: petFormData.microchip && petFormData.microchip.trim() !== '' ? petFormData.microchip : null
            };

            if (editingPetId) {
                // UPDATE existing pet
                await api.put(
                    `/patients/${editingPetId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // CREATE new pet
                await api.post(
                    `/clients/${client.id}/patients`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            resetForm();
            await fetchPets();
        } catch (error) {
            console.error('Error saving pet:', error);
            alert(`Failed to ${editingPetId ? 'update' : 'add'} pet. Please try again.`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm('Are you sure you want to delete this pet? This action cannot be undone.')) return;

        try {
            await api.delete(
                `/patients/${petId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchPets();
        } catch (error) {
            console.error('Error deleting pet:', error);
            alert('Failed to delete pet. Please try again.');
        }
    };

    const handleMarkDeceased = async (petId) => {
        if (!window.confirm('Mark this pet as deceased? This action cannot be undone.')) return;

        try {
            await api.put(
                `/patients/${petId}/status`,
                { isDeceased: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchPets();
        } catch (error) {
            console.error('Error updating pet status:', error);
            alert('Failed to update pet status. Please try again.');
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
                        <h3 className="text-xl font-bold text-gray-900">🐾 Pet Manager</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {client.firstName} {client.lastName}
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
                    {/* Add/Edit Pet Form */}
                    <div className={`border rounded-lg p-5 mb-6 ${editingPetId ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200'}`}>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingPetId ? '✏️ Edit Pet' : '➕ Add New Pet'}
                        </h4>
                        <form onSubmit={handleSubmitPet}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Pet Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={petFormData.name}
                                        onChange={handlePetFormChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Rex, Luna"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Birth Date
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center">
                                            <input
                                                id="isApprox"
                                                type="checkbox"
                                                name="isDateOfBirthApproximate"
                                                checked={petFormData.isDateOfBirthApproximate}
                                                onChange={handlePetFormChange}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="isApprox" className="ml-2 text-xs text-gray-600">
                                                Approximate / Year Only
                                            </label>
                                        </div>
                                        {petFormData.isDateOfBirthApproximate ? (
                                            <input
                                                type="text"
                                                name="birthDate"
                                                value={petFormData.birthDate}
                                                onChange={handlePetFormChange}
                                                placeholder="YYYY-01-01 (Estim.)"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <input
                                                type="date"
                                                name="birthDate"
                                                value={petFormData.birthDate}
                                                onChange={handlePetFormChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Species *
                                    </label>
                                    <select
                                        name="species"
                                        value={petFormData.species}
                                        onChange={handlePetFormChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Species</option>
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Bird">Bird</option>
                                        <option value="Rabbit">Rabbit</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Sex
                                    </label>
                                    <select
                                        name="sex"
                                        value={petFormData.sex}
                                        onChange={handlePetFormChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Breed
                                    </label>
                                    <input
                                        type="text"
                                        name="breed"
                                        value={petFormData.breed}
                                        onChange={handlePetFormChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Golden Retriever"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Microchip Number
                                    </label>
                                    <input
                                        type="text"
                                        name="microchip"
                                        value={petFormData.microchip}
                                        onChange={handlePetFormChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="15-digit number"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4 gap-3">
                                {/* Cancel Button (Only in Edit Mode) */}
                                {editingPetId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Cancel
                                    </button>
                                )}

                                {/* Save / Add Button */}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`${editingPetId
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white font-bold py-2 px-4 rounded shadow-md disabled:opacity-50`}
                                >
                                    {saving
                                        ? (editingPetId ? 'Saving...' : 'Adding...')
                                        : (editingPetId ? 'Save' : '+ Add Pet')
                                    }
                                </button>
                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pets.map((pet) => {
                                    const age = calculateAge(pet.birthDate);
                                    return (
                                        <div
                                            key={pet.id}
                                            className={`border rounded-lg p-4 ${pet.isDeceased
                                                ? 'bg-red-50 border-red-300 opacity-70'
                                                : editingPetId === pet.id
                                                    ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-400'
                                                    : 'bg-white border-gray-200 hover:shadow-md'
                                                } transition-shadow`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h5 className={`text-lg font-bold ${pet.isDeceased ? 'text-red-700 line-through' : 'text-gray-900'
                                                            }`}>
                                                            {pet.name}
                                                        </h5>
                                                        {age && !pet.isDeceased && (
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                {age} old
                                                            </span>
                                                        )}
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
                                                        {pet.birthDate && (
                                                            <div><strong>DOB:</strong> {new Date(pet.birthDate).toLocaleDateString()}</div>
                                                        )}
                                                        {pet.microchip && (
                                                            <div className="text-xs text-gray-500 mt-2">
                                                                Microchip: {pet.microchip}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {!pet.isDeceased && (
                                                <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => handleEditPet(pet)}
                                                        className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded font-medium transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePet(pet.id)}
                                                        className="text-xs text-white bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded font-medium transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkDeceased(pet.id)}
                                                        className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded font-medium transition-colors"
                                                    >
                                                        ☠️ Mark Deceased
                                                    </button>
                                                    <button
                                                        onClick={() => handleInitiateTransfer(pet)}
                                                        className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded font-medium transition-colors"
                                                    >
                                                        ⇄ Transfer
                                                    </button>
                                                </div>
                                            )}

                                            {/* Transfer Mode UI for this pet */}
                                            {transferPetId === pet.id && (
                                                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                                                    <h5 className="font-bold text-indigo-900 mb-2">Transfer Ownership</h5>
                                                    <p className="text-sm text-indigo-700 mb-3">Select the new owner for {pet.name}:</p>
                                                    <div className="mb-4">
                                                        <ClientSearchDropdown
                                                            clients={allClients.filter(c => c.id !== client.id)}
                                                            selectedClient={targetClient}
                                                            onSelect={setTargetClient}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={cancelTransfer}
                                                            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
                                                            disabled={saving}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleConfirmTransfer}
                                                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold"
                                                            disabled={!targetClient || saving}
                                                        >
                                                            {saving ? 'Transferring...' : 'Confirm Transfer'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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
// CLIENT HISTORY MODAL - View & Edit Visits
// ============================================
const ClientHistoryModal = ({ client, onClose, token }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);

    useEffect(() => {
        if (client?.id) {
            fetchRecords();
        }
    }, [client?.id]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/medical-records/client/${client.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRecords(response.data || []);
        } catch (error) {
            console.error('Error fetching visit history:', error);
            alert('Failed to load visit history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setIsEditRecordModalOpen(true);
    };

    const handleRecordSaved = () => {
        setIsEditRecordModalOpen(false);
        setSelectedRecord(null);
        fetchRecords(); // Refresh list
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                            <h3 className="text-xl font-bold text-gray-900">📋 Medical History</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {client.firstName} {client.lastName}
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
                        ) : records.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No medical records found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {records.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {formatDate(record.visitDate || record.createdAt)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {record.patient?.name || 'Unknown'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {record.appointment?.type || record.appointmentType || 'Visit'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                                                    {record.diagnosis || 'No diagnosis'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleEditClick(record)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title="Edit Record"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
            {isEditRecordModalOpen && selectedRecord && (
                <MedicalRecordModal
                    record={selectedRecord}
                    onClose={() => setIsEditRecordModalOpen(false)}
                    onSave={handleRecordSaved}
                    token={token}
                />
            )}
        </>
    );
};

// ============================================
// MEDICAL RECORD MODAL - Edit Record
// ============================================
const MedicalRecordModal = ({ record, onClose, onSave, token }) => {
    const [formData, setFormData] = useState({
        weight: '',
        temperature: '',
        symptoms: '',
        diagnosis: '',
        treatment: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (record) {
            setFormData({
                weight: record.weight || '',
                temperature: record.temperature || '',
                symptoms: record.symptoms || '',
                diagnosis: record.diagnosis || '',
                treatment: record.treatment || ''
            });
        }
    }, [record]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                id: record.id,
                weight: parseFloat(formData.weight),
                temperature: parseFloat(formData.temperature),
                symptoms: formData.symptoms,
                diagnosis: formData.diagnosis,
                treatment: formData.treatment
            };

            await api.put(
                `/medical-records/${record.id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onSave();
        } catch (error) {
            console.error('Error updating record:', error);
            alert('Failed to update medical record.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-8">
                <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 mb-6 -mx-8 -mt-8 rounded-t-lg">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Medical Record</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
                </div>

                <form onSubmit={handleSubmit} className="py-2 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" step="0.1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                            <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" step="0.1" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                        <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                        <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                        <textarea name="treatment" value={formData.treatment} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-bold transition-colors"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold transition-colors"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientsPage;
