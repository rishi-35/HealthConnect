import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigation, Pagination } from "swiper/modules"; // Removed Autoplay
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import NavigateButton from "./NavigateButton";

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    

    const fetchAppointments = async (lat, lon) => {
      try {
        const response = await axios.get("/api/patient/upcoming", {
          params: { latitude: lat, longitude: lon },
          withCredentials: true,
        });
      

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

  // Function to redirect to Google Maps with directions
  const handleMapRedirect = (doctorLat, doctorLng) => {
    if (latitude && longitude && doctorLat && doctorLng) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${doctorLat},${doctorLng}&travelmode=driving`;
      window.open(url, "_blank");
     
    } else {
      alert("Unable to determine location for navigation.");
    }
  };

  if (loading) return <p className="text-center text-gray-600 font-medium">Loading...</p>;
  if (error) return <p className="text-center text-red-500 font-medium">{error}</p>;

  return (
    <section className="bg-white py-10 px-5 flex items-center  sm:py-16 sm:px-3">
      <div className="w-[90%] m-auto">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-10 sm:text-2xl">Upcoming Appointments</h2>
        <Swiper
          modules={[Navigation, Pagination]} // Removed Autoplay
          pagination={{ clickable: true }}
          navigation
          autoplay={false} // Disabled auto-scroll
          spaceBetween={20} // Reduced spacing for better fit
          slidesPerView={2} // Default for large screens
          className="w-full" // Full width for responsiveness
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 10 }, // Small screens (0-576px)
            577: { slidesPerView: 1, spaceBetween: 20 },
            900: { slidesPerView: 2, spaceBetween: 30 }, // Medium screens (577-1023px)
            // 1024: { slidesPerView: 2, spaceBetween: 30 }, // Large screens (1024px and above)
          }}
        >
          {Array.isArray(appointments) && appointments.length === 0 ? (
            <div className="text-center text-gray-500 w-full">No upcoming appointments.</div>
          ) : (
            Array.isArray(appointments) &&
            appointments.map((appointment) => {
              const doctorLat = appointment.doctor?.hospitalLocation?.latitude;
              const doctorLng = appointment.doctor?.hospitalLocation?.longitude;
              const doctorProfilePhoto = appointment.doctor?.profilePhoto
                ? `https://healthconnect-w2m6.onrender.com${appointment.doctor.profilePhoto}`
                : "https://placehold.co/150x150";

              return (
                <SwiperSlide key={appointment._id}>
                  <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md flex items-center relative">
                    <img
                      src={doctorProfilePhoto}
                      alt="Doctor"
                      className="w-32 h-40 object-cover border-2 border-blue-300 shadow-sm mr-6"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/150x150";
                      }}
                    />
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-blue-600 mb-2">{appointment.doctor?.name}</h3>
                      <p className="text-gray-600 italic mb-2">
                        "{appointment.doctor?.name} is ready for your appointment"
                      </p>
                      <div className="flex justify-start mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Specialization: {appointment.doctor?.specialization || "N/A"}</p>
                      <p className="text-sm text-gray-500">
  {new Date(appointment.dateTime).toLocaleString('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}
</p>

                      <p className="text-sm text-gray-500">Fee: ₹{appointment.doctor?.fee || "N/A"}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.doctor?.address?.city}, {appointment.doctor?.address?.state || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Distance: {appointment.doctor?.distance || "N/A"} km
                      </p>
                    </div>
                    {doctorLat && doctorLng && (
                     <NavigateButton
                     originLat={latitude}
                     originLng={longitude}
                     destLat={doctorLat}
                     destLng={doctorLng}
                   />
                    )}
                  </div>
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
      </div>
    </section>
  );
}