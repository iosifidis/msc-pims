import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardHome = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get('http://localhost:8080/api/dashboard/stats', config);
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics.");
        setLoading(false);
      }
    };

    if (token) {
        fetchStats();
    } else {
        setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients Card */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <span className="text-4xl mb-2 block">👥</span>
          <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Total Patients</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalPatients}</p>
        </div>

        {/* Total Appointments Card */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <span className="text-4xl mb-2 block">📅</span>
          <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</p>
        </div>

        {/* Today's Appointments Card */}
        <div className={`bg-white rounded-lg shadow-md p-6 text-center border hover:shadow-lg transition-shadow duration-200 ${stats.appointmentsToday > 0 ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
          <span className="text-4xl mb-2 block">⏰</span>
          <h3 className={`font-bold text-sm uppercase tracking-wider mb-2 ${stats.appointmentsToday > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            Today's Appointments
          </h3>
          <p className="text-3xl font-bold text-gray-800">{stats.appointmentsToday}</p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <span className="text-4xl mb-2 block">💰</span>
          <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-800">
            ${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
