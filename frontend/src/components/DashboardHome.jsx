import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardHome = () => {
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
        const response = await axios.get('http://localhost:8080/api/dashboard/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    padding: '20px'
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #e0e0e0'
  };

  const titleStyle = {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '1rem',
    fontWeight: 'bold'
  };

  const valueStyle = {
    margin: '0',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333'
  };

  const iconStyle = {
    fontSize: '2.5rem',
    marginBottom: '10px',
    display: 'block'
  };

  return (
    <div className="dashboard-home">
      <h2 style={{ paddingLeft: '20px', marginBottom: '10px' }}>Dashboard Overview</h2>
      <div style={containerStyle}>
        {/* Total Patients Card */}
        <div style={cardStyle}>
          <span style={iconStyle}>👥</span>
          <h3 style={titleStyle}>Total Patients</h3>
          <p style={valueStyle}>{stats.totalPatients}</p>
        </div>

        {/* Total Appointments Card */}
        <div style={cardStyle}>
          <span style={iconStyle}>📅</span>
          <h3 style={titleStyle}>Total Appointments</h3>
          <p style={valueStyle}>{stats.totalAppointments}</p>
        </div>

        {/* Today's Appointments Card */}
        <div style={{
          ...cardStyle,
          border: stats.appointmentsToday > 0 ? '2px solid #28a745' : cardStyle.border
        }}>
          <span style={iconStyle}>⏰</span>
          <h3 style={{...titleStyle, color: stats.appointmentsToday > 0 ? '#28a745' : titleStyle.color}}>
            Today's Appointments
          </h3>
          <p style={{...valueStyle, color: stats.appointmentsToday > 0 ? '#28a745' : valueStyle.color}}>
            {stats.appointmentsToday}
          </p>
        </div>

        {/* Total Revenue Card */}
        <div style={cardStyle}>
          <span style={iconStyle}>💶</span>
          <h3 style={titleStyle}>Total Revenue</h3>
          <p style={{...valueStyle, color: '#007bff'}}>
            {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
