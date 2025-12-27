import { useState, useEffect } from "react";
import axios from "axios";
import CalendarView from "./CalendarView";

const DashboardHome = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for existing stats (Total Patients, Appointments Today)
  // Initialized to 0, would typically be fetched from an API endpoint like /api/dashboard/stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0
  });

  // Live Clock: Update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch Next Appointment Data
  useEffect(() => {
    const fetchNextAppointment = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get("/api/appointments/next", config);
        if (response.status === 204) {
          setNextAppointment(null);
        } else {
          setNextAppointment(response.data);
        }
      } catch (error) {
        // Handle 404 or empty response as no appointment
        console.log("No next appointment found or error fetching:", error);
        setNextAppointment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNextAppointment();
    
    // Note: You would likely fetch the 'stats' here as well if an endpoint exists
    // e.g. const statsRes = await axios.get("/api/dashboard/stats", config);
    // setStats(statsRes.data);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Clock and Next Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Live Clock */}
        <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-blue-600 flex flex-col justify-center items-center h-full">
          <h2 className="text-gray-500 font-medium mb-2">Current Time</h2>
          <div className="text-5xl font-mono font-bold text-gray-800 mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-xl text-gray-600">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Right: Next Appointment Card */}
        <div className="bg-white rounded-xl shadow-md border border-blue-200 overflow-hidden flex flex-col h-full">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-blue-800">Next Appointment</h3>
          </div>
          <div className="p-6 flex-grow flex flex-col justify-center">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : nextAppointment ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-semibold">Patient</p>
                    <p className="text-xl font-bold text-gray-900">{nextAppointment.patient?.name}</p>
                    <p className="text-sm text-gray-600">
                      Owner: {nextAppointment.client?.firstName} {nextAppointment.client?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Time</p>
                    <p className="text-xl font-bold text-blue-600">
                      {nextAppointment.date ? formatTime(new Date(nextAppointment.date)) : "TBD"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold">Reason</p>
                  <p className="text-gray-800">{nextAppointment.reason || "General Checkup"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointments Today Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Appointments Today</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-800">
              {stats.appointmentsToday}
            </p>
          </div>
        </div>

        {/* Total Patients Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Patients</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalPatients}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CalendarView />
      </div>
    </div>
  );
};

export default DashboardHome;
