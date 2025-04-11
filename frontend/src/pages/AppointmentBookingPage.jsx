import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, isSameDay, differenceInYears, isValid } from "date-fns";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";

// NavigateButton Component (embedded for simplicity)
const NavigateButton = ({ originLat, originLng, destLat, destLng }) => {
  const handleRedirect = () => {
    if (originLat && originLng && destLat && destLng) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
      window.open(url, "_blank");
   
    } else {
      alert("Unable to determine location for navigation.");
    }
  };

  return (
    <button
      onClick={handleRedirect}
      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-blue-300 hover:bg-blue-100"
      title="Get Directions"
    >
      <FontAwesomeIcon icon={faLocationArrow} size="lg" />
      <span className="text-base">Navigate</span>
    </button>
  );
};

const AppointmentBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [distance, setDistance] = useState(null);

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      setLoadingDoctor(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/doctors/${id}`,
          { withCredentials: true }
        );
        setDoctor(response.data.doctor);
      } catch (error) {
        console.error(
          "Error fetching doctor:",
          error.response?.data || error.message
        );
        setDoctor(null);
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          setUserLocation({ lat: null, lng: null });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation({ lat: null, lng: null });
    }
  }, []);

  // Calculate distance when doctor and userLocation are available
  useEffect(() => {
    if (doctor?.hospitalLocation?.coordinates && userLocation.lat && userLocation.lng) {
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
      };

      const [lng, lat] = doctor.hospitalLocation.coordinates;
      const dist = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
      setDistance(dist.toFixed(2)); // Round to 2 decimal places
    } else {
      setDistance(null);
    }
  }, [doctor, userLocation]);

  // Fetch available slots for selected date
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor) return;
      setLoadingSlots(true);
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const response = await axios.get(
          `http://localhost:5000/api/doctors/${id}/available-slots`,
          {
            params: { date: formattedDate },
            withCredentials: true,
          }
        );
        setAvailableSlots(response.data.slots || []);
      } catch (error) {
        console.error(
          "Error fetching slots:",
          error.response?.data || error.message
        );
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [doctor, selectedDate, id]);

  // Fetch reviews and normalize data
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/doctors/${id}/reviews`,
          { withCredentials: true }
        );
        const normalizedReviews = (response.data.reviews || []).map(review => ({
          user: review.patient?.name || "Anonymous",
          text: review.comment || review.text || "",
          rating: review.rating || 0,
          createdAt: review.date || review.createdAt || new Date(),
        }));
        setReviews(normalizedReviews);
      } catch (error) {
        console.error(
          "Error fetching reviews:",
          error.response?.data || error.message
        );
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Generate date options (next 7 days)
  const getDateOptions = () => {
    const options = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);

      options.push(date);
    }
    return options;
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setBookingError("");
  };

  // Handle appointment booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!user) {
      setBookingError("Please log in to book an appointment.");
      toast.error("Please log in to book an appointment.");
      return;
    }
    if (!selectedSlot) {
      setBookingError("Please select a time slot.");
      toast.error("Please select a time slot.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appointments/book",
        {
          doctorId: id,
          dateTime: selectedSlot.start,
          paymentMethod,
          notes,
        },
        { withCredentials: true }
      );

      if (paymentMethod === "online" && response.data.orderId) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const options = {
            key: "rzp_test_wvUmFNas1Dodbk",
            amount: response.data.amount,
            currency: response.data.currency,
            name: "Doctor Appointment Booking",
            description: `Appointment with ${doctor?.name}`,
            order_id: response.data.orderId,
            handler: async () => {
              setBookingSuccess(true);
              setBookingError("");
              toast.success("Payment successful! Appointment booked.", {
                duration: 4000,
              });
              navigate("/");
            },
            prefill: {
              name: user.name || "",
              email: user.email || "",
              contact: user.phone || "",
            },
            theme: { color: "#2563EB" },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        script.onerror = () => {
          setBookingError("Failed to load payment gateway.");
          toast.error("Failed to load payment gateway.");
        };
        document.body.appendChild(script);
      } else {
        setBookingSuccess(true);
        setBookingError("");
        toast.success("Appointment booked successfully!", { duration: 4000 });
        navigate("/");
      }
    } catch (error) {
      setBookingError(
        error.response?.data?.error || "Failed to book appointment."
      );
      toast.error(error.response?.data?.error || "Failed to book appointment.");
      setBookingSuccess(false);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a review.");
      return;
    }
    if (!reviewText || rating === 0) {
      toast.error("Please provide a review and rating.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/doctors/${id}/reviews`,
        { text: reviewText, rating },
        { withCredentials: true }
      );
      const newReview = {
        user: user.name || "Anonymous",
        text: reviewText,
        rating,
        createdAt: new Date(),
      };
      setReviews([...reviews, newReview]);
      setReviewText("");
      setRating(0);
      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit review.");
    }
  };

  // Helper function to format hospitalLocation
  const formatHospitalLocation = (location) => {
    if (!location) return "N/A";
    if (typeof location === "string") return location;
    if (location.coordinates) {
      const [lng, lat] = location.coordinates;
      return `${lat}, ${lng}`;
    }
    return "N/A";
  };

  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const dob = new Date(dateOfBirth);
    return differenceInYears(new Date(), dob);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-blue-900 mb-8 flex items-center">
          <span className="material-icons mr-2">event</span>
          Book Appointment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Details */}
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[600px]"
          >
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="material-icons mr-2">person</span>
                Doctor Details
              </h2>
              {loadingDoctor ? (
                <div className="flex justify-center items-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
                  />
                </div>
              ) : !doctor ? (
                <p className="text-red-600 text-center">Doctor not found.</p>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={
                      doctor.profilePhoto
                        ? `http://localhost:5000${doctor.profilePhoto}`
                        : "/defaultDoctor.jpg"
                    }
                    alt={doctor.name}
                    className="w-64 h-48 rounded-lg object-cover border-2 border-blue-200 shadow-sm mb-4"
                  />
                  <h3 className="text-xl font-semibold text-blue-900">
                    {doctor.name}
                  </h3>
                  <p className="text-blue-700 font-medium">
                    {doctor.specialization || "N/A"}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`h-2 w-2 rounded-full mr-2 ${
                        doctor.activestatus ? "bg-green-400 opacity-70" : "bg-red-400 opacity-70"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        doctor.activestatus ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {doctor.activestatus ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-2 space-y-1 text-sm">
                    <p>
                      <strong>Address:</strong> {doctor.address || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {formatHospitalLocation(doctor.hospitalLocation)}
                    </p>
                    <p>
                      <strong>Distance:</strong>{" "}
                      {distance ? `${distance} km` : "Calculating..."}
                    </p>
                    <p>
                      <strong>Gender:</strong> {doctor.gender || "N/A"}
                    </p>
                    <p>
                      <strong>Age:</strong> {calculateAge(doctor.dateOfBirth)}
                    </p>
                    <p>
                      <strong>Email:</strong> {doctor.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {doctor.phone || "N/A"}
                    </p>
                  </div>
                  <p className="text-green-600 font-semibold mt-2">
                    ₹{doctor.fee || "N/A"}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-blue-700 font-medium">
                      {doctor.rating || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {doctor?.hospitalLocation?.coordinates && (
              <div className="mt-4 flex justify-end">
                <NavigateButton
                  originLat={userLocation.lat}
                  originLng={userLocation.lng}
                  destLat={doctor.hospitalLocation.coordinates[1]}
                  destLng={doctor.hospitalLocation.coordinates[0]}
                />
              </div>
            )}
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-between min-h-[600px]"
          >
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                <span className="material-icons mr-2">calendar_today</span>
                Select Appointment Time
              </h2>

              <div className="mb-6">
                <label className="block text-blue-700 text-sm font-bold mb-2">
                  Select Date
                </label>
                <div className="flex flex-wrap gap-2">
                  {getDateOptions().map((date) => (
                    <motion.button
                      key={date.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        isSameDay(date, selectedDate)
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                      }`}
                    >
                      {format(date, "dd, MM, yyyy")}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-blue-700 text-sm font-bold mb-2">
                  Available Slots
                </label>
                {loadingSlots ? (
                  <div className="flex justify-center items-center h-32">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
                    />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-blue-600 text-center">
                    No slots available for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <motion.button
                        key={slot.start}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSlotSelect(slot)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedSlot?.start === slot.start
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                        }`}
                      >
                        {slot.localTime}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleBookAppointment}>
                <div className="mb-4">
                  <label className="block text-blue-700 text-sm font-bold mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-blue-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online (Razorpay)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-blue-700 text-sm font-bold mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-blue-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="4"
                  />
                </div>

                {bookingError && (
                  <p className="text-red-600 mb-4">{bookingError}</p>
                )}
                {bookingSuccess && (
                  <p className="text-green-600 mb-4">
                    Appointment booked successfully!
                  </p>
                )}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loadingSlots || !selectedSlot}
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors duration-300 ${
                    loadingSlots || !selectedSlot
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Book Appointment
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Reviews Section (Full Width) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 col-span-full"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <span className="material-icons mr-2">star</span>
              Reviews
            </h2>

            {loadingReviews ? (
              <div className="flex justify-center items-center h-32">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
                />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-600 text-center">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <p className="text-gray-800 font-medium">{review.user}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-yellow-400 ${
                            i < review.rating ? "fill-current" : "opacity-30"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 mt-1">{review.text}</p>
                    <p className="text-gray-500 text-sm">
                      {review.createdAt
                        ? format(new Date(review.createdAt), "dd, MM, yyyy")
                        : "Date not available"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="mt-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Add Your Review
              </h3>
              <div className="mb-4">
                <label className="block text-blue-700 text-sm font-bold mb-2">
                  Rating
                </label>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setRating(i + 1)}
                      className={`text-2xl ${
                        i < rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-blue-700 text-sm font-bold mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-blue-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300"
              >
                Submit Review
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AppointmentBookingPage;