import { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';

// Appointment Types matching backend enums
const APPOINTMENT_TYPES = [
    { value: 'EXAM', label: 'Exam', color: '#3b82f6' },
    { value: 'SURGERY', label: 'Surgery', color: '#ef4444' },
    { value: 'VACCINATION', label: 'Vaccination', color: '#22c55e' },
    { value: 'GROOMING', label: 'Grooming', color: '#f97316' },
    { value: 'CHECKUP', label: 'Check-up', color: '#a855f7' },
    { value: 'EMERGENCY', label: 'Emergency', color: '#dc2626' },
];

// Appointment Statuses with button colors
const APPOINTMENT_STATUSES = [
    { value: 'SCHEDULED', label: 'Scheduled', buttonClass: 'bg-blue-600 hover:bg-blue-700' },
    { value: 'CONFIRMED', label: 'Confirmed', buttonClass: 'bg-indigo-600 hover:bg-indigo-700' },
    { value: 'IN_PROGRESS', label: 'In Progress', buttonClass: 'bg-orange-600 hover:bg-orange-700' },
    { value: 'COMPLETED', label: 'Completed', buttonClass: 'bg-green-600 hover:bg-green-700' },
    { value: 'CANCELLED', label: 'Cancelled', buttonClass: 'bg-red-600 hover:bg-red-700' },
    { value: 'NO_SHOW', label: 'No Show', buttonClass: 'bg-gray-600 hover:bg-gray-700' },
];

// ============================================
// SEARCHABLE CLIENT DROPDOWN COMPONENT
// ============================================
const ClientSearchDropdown = ({ clients, selectedClient, onSelect, disabled }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredClients, setFilteredClients] = useState([]);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredClients(clients.slice(0, 10));
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = clients.filter(client => {
            const firstName = (client.firstName || '').toLowerCase();
            const lastName = (client.lastName || '').toLowerCase();
            const fullName = `${firstName} ${lastName}`;
            const phone = client.phoneNumber || client.phone || '';

            return (
                firstName.includes(searchLower) ||
                lastName.includes(searchLower) ||
                fullName.includes(searchLower) ||
                phone.includes(searchTerm)
            );
        });

        setFilteredClients(filtered.slice(0, 10));
    }, [searchTerm, clients]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (client) => {
        onSelect(client);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setSearchTerm('');
        inputRef.current?.focus();
    };

    const getClientDisplayName = (client) => {
        if (!client) return '';
        const phone = client.phoneNumber || client.phone || '';
        return `${client.firstName} ${client.lastName}${phone ? ` (${phone})` : ''}`;
    };

    if (disabled && selectedClient) {
        return (
            <div className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed">
                {getClientDisplayName(selectedClient)}
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {selectedClient ? (
                <div className="flex items-center justify-between w-full border border-gray-300 rounded-md px-4 py-2 bg-blue-50">
                    <span className="text-blue-700 font-medium">
                        {getClientDisplayName(selectedClient)}
                    </span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder="Search Client by Name or Phone..."
                            disabled={disabled}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {isOpen && filteredClients.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredClients.map((client) => (
                                <div
                                    key={client.id}
                                    onClick={() => handleSelect(client)}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900">
                                        {client.firstName} {client.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        📞 {client.phoneNumber || client.phone || 'No phone'}
                                        {client.email && ` • ${client.email}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isOpen && searchTerm && filteredClients.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
                            No clients found matching "{searchTerm}"
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ============================================
// STATUS BUTTON COMPONENT (Clickable Action Button)
// ============================================
const StatusButton = ({ status, onClick }) => {
    const config = APPOINTMENT_STATUSES.find(s => s.value === status) || {
        label: status,
        buttonClass: 'bg-blue-600 hover:bg-blue-700'
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
            className={`${config.buttonClass} text-white font-bold py-2 px-4 rounded shadow-md uppercase text-xs tracking-wider transition hover:scale-105`}
        >
            {config.label}
        </button>
    );
};

// Status Badge for Modal display (non-clickable)
const StatusBadge = ({ status }) => {
    const config = APPOINTMENT_STATUSES.find(s => s.value === status) || {
        label: status,
        buttonClass: 'bg-gray-600'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${config.buttonClass.split(' ')[0]}`}>
            {config.label}
        </span>
    );
};

// ============================================
// MAIN COMPONENT: AppointmentsPage
// ============================================
const AppointmentsPage = () => {
    const { user, token } = useAuth();

    // Data State
    const [events, setEvents] = useState([]);
    const [clients, setClients] = useState([]);
    const [patients, setPatients] = useState([]);
    const [vets, setVets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientsLoading, setPatientsLoading] = useState(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState({ start: null, end: null });

    // Form Fields
    const [formData, setFormData] = useState({
        patientId: '',
        vetId: '',
        type: 'EXAM',
        status: 'SCHEDULED',
        notes: '',
        startTime: '',
        endTime: ''
    });

    // Check if appointment is completed (locked/read-only)
    const isLocked = formData.status === 'COMPLETED';

    // ============================================
    // DATA FETCHING
    // ============================================
    const fetchAppointments = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/appointments`, config);

            const formattedEvents = response.data.map(appt => {
                const typeConfig = APPOINTMENT_TYPES.find(t => t.value === appt.type) || APPOINTMENT_TYPES[0];
                return {
                    id: appt.id,
                    title: `${appt.patient?.name || 'Unknown'} - ${typeConfig.label}`,
                    start: appt.startTime,
                    end: appt.endTime,
                    backgroundColor: typeConfig.color,
                    borderColor: typeConfig.color,
                    extendedProps: { appointment: appt }
                };
            });

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchClients = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/clients`, config);
            setClients(response.data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    }, [token]);

    const fetchVets = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/users/vets`, config);
            setVets(response.data || []);
        } catch (error) {
            console.error('Error fetching vets:', error);
            if (user) {
                setVets([{ id: user.id, fullName: user.username, username: user.username }]);
            }
        }
    }, [token, user]);

    const fetchPatientsForClient = useCallback(async (clientId) => {
        if (!clientId) {
            setPatients([]);
            return;
        }

        setPatientsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/patients/owner/${clientId}`, config);
            setPatients(response.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setPatients([]);
        } finally {
            setPatientsLoading(false);
        }
    }, [token]);

    const searchAppointments = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/appointments/search?query=${encodeURIComponent(query)}`, config);
            setSearchResults(response.data || []);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Error searching appointments:', error);
            const filtered = events
                .filter(event => {
                    const appt = event.extendedProps.appointment;
                    const searchLower = query.toLowerCase();
                    const clientName = `${appt.client?.firstName || ''} ${appt.client?.lastName || ''}`.toLowerCase();
                    const patientName = (appt.patient?.name || '').toLowerCase();
                    const phone = appt.client?.phone || appt.client?.phoneNumber || '';

                    return (
                        clientName.includes(searchLower) ||
                        patientName.includes(searchLower) ||
                        phone.includes(query) ||
                        (appt.type || '').toLowerCase().includes(searchLower)
                    );
                })
                .map(event => event.extendedProps.appointment);

            setSearchResults(filtered);
            setShowSearchResults(true);
        } finally {
            setIsSearching(false);
        }
    }, [token, events]);

    // Initial data load
    useEffect(() => {
        if (token) {
            fetchAppointments();
            fetchClients();
            fetchVets();
        }
    }, [token, fetchAppointments, fetchClients, fetchVets]);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchAppointments(searchTerm);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchAppointments]);

    // Fetch patients when selected client changes
    useEffect(() => {
        if (selectedClient) {
            fetchPatientsForClient(selectedClient.id);
            setFormData(prev => ({ ...prev, patientId: '' }));
        } else {
            setPatients([]);
        }
    }, [selectedClient, fetchPatientsForClient]);

    // ============================================
    // HELPERS
    // ============================================
    const formatDateTimeLocal = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDisplayDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // ============================================
    // FORM HANDLERS
    // ============================================
    const resetForm = () => {
        setFormData({
            patientId: '',
            vetId: user?.id?.toString() || '',
            type: 'EXAM',
            status: 'SCHEDULED',
            notes: '',
            startTime: '',
            endTime: ''
        });
        setPatients([]);
        setSelectedClient(null);
        setIsEditMode(false);
        setSelectedAppointment(null);
    };

    const handleNewAppointmentClick = () => {
        resetForm();

        const now = new Date();
        const minutes = now.getMinutes();
        const start = new Date(now);
        start.setMinutes(minutes < 30 ? 30 : 0);
        start.setSeconds(0);
        start.setMilliseconds(0);
        if (minutes >= 30) start.setHours(start.getHours() + 1);

        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        setSelectedSlot({ start, end });
        setFormData(prev => ({
            ...prev,
            startTime: formatDateTimeLocal(start),
            endTime: formatDateTimeLocal(end),
            vetId: user?.id?.toString() || ''
        }));

        setShowModal(true);
    };

    const handleDateSelect = (selectInfo) => {
        resetForm();

        let start = selectInfo.start;
        let end = selectInfo.end;

        if (selectInfo.view.type === 'dayGridMonth') {
            start = new Date(start);
            start.setHours(9, 0, 0, 0);
            end = new Date(start);
            end.setHours(10, 0, 0, 0);
        }

        setSelectedSlot({ start, end });
        setFormData(prev => ({
            ...prev,
            startTime: formatDateTimeLocal(start),
            endTime: formatDateTimeLocal(end),
            vetId: user?.id?.toString() || ''
        }));

        setShowModal(true);
    };

    const handleEventClick = (clickInfo) => {
        const appointment = clickInfo.event.extendedProps.appointment;
        openAppointmentDetails(appointment);
    };

    const handleSearchResultClick = (appointment) => {
        openAppointmentDetails(appointment);
    };

    const openAppointmentDetails = (appointment) => {
        setIsEditMode(true);
        setSelectedAppointment(appointment);

        const start = new Date(appointment.startTime);
        const end = new Date(appointment.endTime || new Date(start.getTime() + 60 * 60 * 1000));

        setSelectedSlot({ start, end });

        if (appointment.client) {
            setSelectedClient(appointment.client);
        }

        setFormData({
            patientId: '',
            vetId: appointment.vet?.id?.toString() || '',
            type: appointment.type || 'EXAM',
            status: appointment.status || 'SCHEDULED',
            notes: appointment.notes || '',
            startTime: formatDateTimeLocal(start),
            endTime: formatDateTimeLocal(end)
        });

        if (appointment.client?.id) {
            fetchPatientsForClient(appointment.client.id).then(() => {
                setFormData(prev => ({
                    ...prev,
                    patientId: appointment.patient?.id?.toString() || ''
                }));
            });
        }

        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        if (!client) {
            setPatients([]);
            setFormData(prev => ({ ...prev, patientId: '' }));
        }
    };

    const handleSaveAppointment = async () => {
        if (!selectedClient) {
            alert('Please select a client.');
            return;
        }
        if (!formData.patientId) {
            alert('Please select a patient.');
            return;
        }
        if (!formData.vetId) {
            alert('Please select a veterinarian.');
            return;
        }
        if (!formData.startTime || !formData.endTime) {
            alert('Please select start and end times.');
            return;
        }

        const payload = {
            clientId: parseInt(selectedClient.id),
            patientId: parseInt(formData.patientId),
            vetId: parseInt(formData.vetId),
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
            type: formData.type,
            status: formData.status,
            notes: formData.notes
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (isEditMode && selectedAppointment) {
                await axios.put(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, payload, config);
                alert('Appointment updated successfully!');
            } else {
                await axios.post(`${API_BASE_URL}/appointments`, payload, config);
                alert('Appointment created successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchAppointments();

            if (searchTerm) {
                searchAppointments(searchTerm);
            }
        } catch (error) {
            console.error('Error saving appointment:', error);
            alert(`Failed to save appointment: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteAppointment = async () => {
        if (!selectedAppointment) return;
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_BASE_URL}/appointments/${selectedAppointment.id}`, config);
            alert('Appointment deleted successfully!');
            setShowModal(false);
            resetForm();
            fetchAppointments();

            if (searchTerm) {
                searchAppointments(searchTerm);
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Failed to delete appointment.');
        }
    };

    const handleExamineOrMedicalRecord = () => {
        // Both Examine and Medical Record open the modal - already open
        // This is just a placeholder for future navigation to actual medical record page
        console.log("Exam feature coming soon");
    };

    const handlePatientHistory = () => {
        console.log('Patient History feature coming soon');
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // ============================================
    // RENDER
    // ============================================
    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* ===== HEADER ===== */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900">Appointments</h1>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search appointments..."
                            className="border border-gray-300 rounded-md px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                        {searchTerm && !isSearching && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleNewAppointmentClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors"
                    >
                        + New Appointment
                    </button>
                </div>
            </div>

            {/* ===== COLOR LEGEND ===== */}
            <div className="flex justify-end gap-2 mb-4">
                {APPOINTMENT_TYPES.map(type => (
                    <span
                        key={type.value}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: type.color }}
                    >
                        {type.label}
                    </span>
                ))}
            </div>

            {/* ===== SEARCH RESULTS TABLE ===== */}
            {showSearchResults && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                {searchResults.length} found
                            </span>
                        </div>
                        <button
                            onClick={handleClearSearch}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Clear Search
                        </button>
                    </div>

                    {searchResults.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-400">
                            No appointments found matching "{searchTerm}"
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date/Time
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Owner (Phone)
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pet
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {searchResults.map((appointment) => (
                                    <tr
                                        key={appointment.id}
                                        onClick={() => handleSearchResultClick(appointment)}
                                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {formatDisplayDateTime(appointment.startTime)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {appointment.client?.firstName} {appointment.client?.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.client?.phone || appointment.client?.phoneNumber || 'No phone'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                🐾 {appointment.patient?.name || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.patient?.species || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900">{appointment.type}</div>
                                            {appointment.notes && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {appointment.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusButton 
                                                status={appointment.status} 
                                                onClick={() => handleSearchResultClick(appointment)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ===== CALENDAR SECTION ===== */}
            {!showSearchResults && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={events}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        slotMinTime="07:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        slotDuration="00:30:00"
                        height="auto"
                        eventDisplay="block"
                        nowIndicator={true}
                    />
                </div>
            )}

            {/* ===== APPOINTMENT MODAL ===== */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-8">
                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 mb-6 -mx-8 -mt-8 rounded-t-lg">
                            <div className="ml-8">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {isLocked ? 'Medical Record' : (isEditMode ? 'Edit Appointment' : 'New Appointment')}
                                    </h2>
                                    {isLocked && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
                                            🔒 Completed
                                        </span>
                                    )}
                                </div>
                                {selectedSlot.start && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedSlot.start.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold mr-8"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="py-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleFormChange}
                                        disabled={isLocked}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleFormChange}
                                        disabled={isLocked}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Client */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Client <span className="text-red-500">*</span>
                                    </label>
                                    <ClientSearchDropdown
                                        clients={clients}
                                        selectedClient={selectedClient}
                                        onSelect={handleClientSelect}
                                        disabled={isEditMode || isLocked}
                                    />
                                </div>

                                {/* Patient */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Patient <span className="text-red-500">*</span>
                                        {patientsLoading && <span className="text-blue-500 ml-2">(Loading...)</span>}
                                    </label>
                                    {!selectedClient ? (
                                        <div className="w-full border border-dashed border-gray-300 rounded-md px-4 py-2 bg-gray-50 text-gray-400">
                                            Select a client first
                                        </div>
                                    ) : patientsLoading ? (
                                        <div className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50 text-gray-500">
                                            Loading pets...
                                        </div>
                                    ) : patients.length === 0 ? (
                                        <div className="w-full border border-yellow-300 rounded-md px-4 py-2 bg-yellow-50 text-yellow-800">
                                            ⚠️ No pets registered.{' '}
                                            <a href="/clients" className="text-blue-600 hover:underline">Add a pet</a>
                                        </div>
                                    ) : (
                                        <select
                                            name="patientId"
                                            value={formData.patientId}
                                            onChange={handleFormChange}
                                            disabled={isLocked}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select a pet...</option>
                                            {patients.map(patient => (
                                                <option key={patient.id} value={patient.id}>
                                                    {patient.name} ({patient.species}{patient.breed ? ` - ${patient.breed}` : ''})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Veterinarian */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Veterinarian <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="vetId"
                                        value={formData.vetId}
                                        onChange={handleFormChange}
                                        disabled={isLocked}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select a vet...</option>
                                        {vets.map(vet => (
                                            <option key={vet.id} value={vet.id}>
                                                {vet.fullName || vet.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Appointment Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Appointment Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleFormChange}
                                        disabled={isLocked}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {APPOINTMENT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status (Edit Mode Only - NOT locked for status changes until saved) */}
                                {isEditMode && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleFormChange}
                                            disabled={isLocked}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        >
                                            {APPOINTMENT_STATUSES.map(status => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Notes (Full Width - Read-only when locked) */}
                                <div className={isEditMode ? 'col-span-1' : 'col-span-2'}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes {isLocked && <span className="text-gray-400">(Read Only)</span>}
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleFormChange}
                                        readOnly={isLocked}
                                        rows={3}
                                        placeholder={isLocked ? '' : 'Add any notes about this appointment...'}
                                        className={`w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                                            isLocked ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex justify-between items-center -mx-8 -mb-8 rounded-b-lg">
                            {isLocked ? (
                                // LOCKED STATE: Only Close and Medical Record buttons
                                <>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleExamineOrMedicalRecord}
                                            className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            📋 View Medical Record
                                        </button>
                                        <button
                                            onClick={handlePatientHistory}
                                            className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-orange-500 hover:bg-orange-600 text-white"
                                        >
                                            📜 Patient History
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-gray-600 hover:bg-gray-700 text-white"
                                    >
                                        Close
                                    </button>
                                </>
                            ) : (
                                // EDITABLE STATE: Full action buttons
                                <>
                                    <div className="flex gap-4">
                                        {isEditMode && (
                                            <>
                                                <button
                                                    onClick={handleDeleteAppointment}
                                                    className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    🗑️ Delete
                                                </button>
                                                <button
                                                    onClick={handleExamineOrMedicalRecord}
                                                    className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    🩺 Examine
                                                </button>
                                                <button
                                                    onClick={handlePatientHistory}
                                                    className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-orange-500 hover:bg-orange-600 text-white"
                                                >
                                                    📜 Patient History
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { setShowModal(false); resetForm(); }}
                                            className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-gray-600 hover:bg-gray-700 text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveAppointment}
                                            disabled={!formData.patientId && patients.length > 0}
                                            className="px-6 py-2 rounded shadow-md font-bold transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isEditMode ? '💾 Update' : '✅ Create'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentsPage;
