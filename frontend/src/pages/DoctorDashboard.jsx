import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format, startOfDay, endOfDay, isAfter, isEqual } from "date-fns";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

// Icons (using Heroicons for a modern look)
import {
  UserCircleIcon,
  CurrencyRupeeIcon,
  StarIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAvailability(), fetchPerformance(), fetchTodayAppointments()]);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch availability
  const fetchAvailability = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors/availability", {
        withCredentials: true,
      });
      setIsAvailable(res.data.isAvailable);
    } catch (err) {
      console.error("Error fetching availability:", err);
      toast.error("Failed to fetch availability status.");
    }
  };

  // Toggle availability
  const toggleAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/doctors/availability",
        {},
        { withCredentials: true }
      );
      setIsAvailable(res.data.isAvailable);
      toast.success(`Status updated to ${res.data.isAvailable ? "Online" : "Offline"}`);
    } catch (err) {
      console.error("Error toggling availability:", err);
      toast.error("Failed to update availability status.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Fetch performance metrics
  const fetchPerformance = async () => {
    try {
      const today = new Date();
      const start = startOfDay(today).toISOString();
      const end = endOfDay(today).toISOString();
      const res = await axios.get("http://localhost:5000/api/doctors/performance", {
        params: { startDate: start, endDate: end, page: 1, limit: 10 },
        withCredentials: true,
      });
      setPerformance(res.data);
    } catch (err) {
      console.error("Error fetching performance:", err);
      toast.error("Failed to fetch performance metrics.");
    }
  };

  // Fetch today's appointments
  const fetchTodayAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments/all", {
        withCredentials: true,
      });
      setTodayAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Error fetching today's appointments:", err);
      toast.error("Failed to fetch today's appointments.");
    }
  };

  // Helper to format appointment time
  const formatTime = (dateTime) => {
    return format(new Date(dateTime), "hh:mm a");
  };

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "cancelled":
        return "text-red-500";
      case "pending":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  // Filter upcoming appointments
  const upcomingAppointments = todayAppointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.dateTime);
    const today = new Date("2025-04-30");
    return isAfter(appointmentDate, today) || isEqual(appointmentDate, today);
  });

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <UserIcon className="w-8 h-8 text-blue-600 mr-3" />
            Doctor Dashboard
          </h1>
          <div className="text-base font-medium text-white bg-blue-500 px-4 py-2 rounded-full shadow-sm">
            Welcome, Dr. {user?.name || "Doctor"}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Availability Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="col-span-1 bg-white rounded-2xl shadow-sm p-6 border border-blue-100"
            >
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Availability Status</h2>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 text-sm font-medium">
                  {isAvailable ? "Online" : "Offline"}
                </span>
                <button
                  onClick={toggleAvailability}
                  disabled={availabilityLoading}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${
                    isAvailable ? "bg-blue-500" : "bg-gray-300"
                  } ${availabilityLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                      isAvailable ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-blue-100"
            >
              <h2 className="text-lg font-semibold text-blue-900 mb-6">Performance Overview</h2>
              {performance ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: UserCircleIcon,
                      label: "Patients Treated",
                      value: performance.numberOfPatientsTreated,
                      color: "blue",
                    },
                    {
                      icon: CurrencyRupeeIcon,
                      label: "Earnings",
                      value: `₹${performance.earnings}`,
                      color: "blue",
                    },
                    {
                      icon: StarIcon,
                      label: "Average Rating",
                      value: performance.averageRating || "N/A",
                      color: "blue",
                    },
                    {
                      icon: XCircleIcon,
                      label: "Cancellations",
                      value: performance.cancellations,
                      color: "blue",
                    },
                    {
                      icon: ClockIcon,
                      label: "Avg. Duration",
                      value: `${performance.averageDuration} min`,
                      color: "blue",
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors`}
                    >
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600 mr-3`} />
                      <div>
                        <p className="text-sm text-blue-700">{metric.label}</p>
                        <p className={`text-lg font-semibold text-${metric.color}-900`}>
                          {metric.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-700 text-center">No performance data available.</p>
              )}
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="col-span-full bg-white rounded-2xl shadow-sm p-6 border border-blue-100"
            >
              <h2 className="text-lg font-semibold text-blue-900 mb-6">Upcoming Appointments</h2>
              {upcomingAppointments.length === 0 ? (
                <p className="text-blue-700 text-center py-6">
                  No upcoming appointments scheduled.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden">
                          <UserCircleIcon className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {appointment.patient?.name || "N/A"}
                          </p>
                          <p className="text-xs text-blue-600">
                            {appointment.patient?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <CalendarIcon className="w-5 h-5 text-blue-500 mr-2" />
                          <p className="text-sm text-blue-700">
                            {format(new Date(appointment.dateTime), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-5 h-5 text-blue-500 mr-2" />
                          <p className="text-sm text-blue-700">
                            {formatTime(appointment.dateTime)} ({appointment.duration} min)
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CurrencyRupeeIcon className="w-5 h-5 text-blue-500 mr-2" />
                          <p className="text-sm text-blue-700">
                            Payment: {appointment.payment.method.charAt(0).toUpperCase() + appointment.payment.method.slice(1)} ({appointment.payment.status.charAt(0).toUpperCase() + appointment.payment.status.slice(1)})
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;