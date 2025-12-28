import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// Assuming CalendarView is in the same directory. Adjust path if necessary.
import CalendarView from "./CalendarView";

const DashboardHome = () => {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loadingNext, setLoadingNext] = useState(true);
  const [apiError, setApiError] = useState(false);

  // --- 1. Live Clock Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- 2. Fetch Next Appointment ---
  useEffect(() => {
    const fetchNextAppointment = async () => {
      try {
        setLoadingNext(true);
        setApiError(false);
        const response = await fetch("/api/appointments/next", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 204) {
          // 204 No Content
          setNextAppointment(null);
        } else if (response.ok) {
          const data = await response.json();
          setNextAppointment(data);
        } else {
          console.error("Failed to fetch next appointment");
          setApiError(true);
        }
      } catch (error) {
        console.error("Error fetching next appointment:", error);
        setApiError(true);
      } finally {
        setLoadingNext(false);
      }
    };

    if (token) {
      fetchNextAppointment();
    }
  }, [token]);

  // Format Date/Time for Clock
  const dateString = currentTime.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="flex flex-col space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* --- Top Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Live Clock */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
            Current Time
          </h2>
          <div className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            {timeString}
          </div>
          <div className="text-lg text-gray-600">{dateString}</div>
        </div>

        {/* Right: Next Appointment Card */}
        <div className="bg-white shadow-md rounded-lg p-6 min-h-[200px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            Next Appointment
          </h2>

          {loadingNext ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : apiError ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 italic">
              No info available
            </div>
          ) : nextAppointment ? (
            <div className="flex-1 flex flex-col justify-center space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Time:</span>
                <span className="text-lg font-bold text-blue-600">
                  {/* Assuming API returns a standard date string or time string in 'dateTime' or 'time' */}
                  {new Date(
                    nextAppointment.dateTime || nextAppointment.time
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Patient:</span>
                <span className="text-gray-900 font-semibold">
                  {nextAppointment.patientName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Owner:</span>
                <span className="text-gray-900">
                  {nextAppointment.ownerName}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-gray-600 font-medium text-sm">
                  Reason:
                </span>
                <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1 text-sm border border-gray-100">
                  {nextAppointment.reason}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 italic">
              No upcoming appointments
            </div>
          )}
        </div>
      </div>

      {/* --- Middle Section: Stat Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Appointments Today */}
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Appointments Today
            </p>
            {/* Placeholder value - connect to stats API if available */}
            <p className="text-3xl font-bold text-gray-900">8</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Patients */}
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Patients
            </p>
            {/* Placeholder value */}
            <p className="text-3xl font-bold text-gray-900">1,240</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* --- Bottom Section: CalendarView --- */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <CalendarView />
      </div>
    </div>
  );
};

export default DashboardHome;
