import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    console.log("useEffect Triggered");
    const fetchAppointments = async (lat, lon) => {
      try {
        const response = await axios.get("http://localhost:5000/api/patient/upcoming", {
          params: { latitude: lat, longitude: lon },
        });
        console.log("API Response:", response.data); // Debugging log

        if (Array.isArray(response.data)) {
          setAppointments(response.data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        setError("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
        
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          console.log("Detected Location:", lat, lon); // Debugging log
          
          setLatitude(lat);
          setLongitude(lon);
          fetchAppointments(lat, lon);
        },
        (error) => {
          console.error("Geolocation Error:", error);
          setError("Failed to detect location");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Upcoming Appointments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(appointments) && appointments.length === 0 ? (
          <p className="text-center col-span-3">No upcoming appointments.</p>
        ) : (
          Array.isArray(appointments) &&
          appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-4">
                <img
                  src={appointment.doctor?.profilePhoto || "/default-doctor.png"}
                  alt="Doctor"
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-lg font-semibold">{appointment.doctor?.name}</h3>
                  <p className="text-gray-600">{appointment.doctor?.specialization}</p>
                  <p className="text-gray-500">{new Date(appointment.dateTime).toLocaleString()}</p>
                  <p className="text-gray-500">Fee: ₹{appointment.doctor?.fee}</p>
                  <p className="text-gray-500">{appointment.doctor?.address?.city}, {appointment.doctor?.address?.state}</p>
                  <p className="text-gray-500">Distance: {appointment.doctor?.distance} km</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}