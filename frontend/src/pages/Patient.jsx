import React, { useEffect, useState, useCallback } from "react";
import UpcomingAppointments from "../components/UpcomingAppointments";
import { useAuthStore } from "../store/authStore";

export default function Patient() {
  // State variables
  const [detectedLocation, setDetectedLocation] = useState("");
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationEdited, setIsLocationEdited] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const {user}=useAuthStore();
  console.log("cur user:", JSON.stringify(user, null, 2));
  // Debounce function for API calls
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }, []);

  // Fetch location suggestions
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data.map((item) => item.display_name));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300),
    [debounce]
  );

  // Geolocation and counters setup
  useEffect(() => {
    // Animate counters
    function animateCounter(id, target, duration, suffix = "") {
      let start = 0;
      const increment = target / (duration / 10);
      const counter = document.getElementById(id);
      if (!counter) return;
      const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(interval);
        }
        if (id === "patients-counter") {
          counter.textContent = Math.floor(start / 1000) + "0K+";
        } else {
          counter.textContent = Math.floor(start) + suffix;
        }
      }, 10);
    }

    animateCounter("patients-counter", 50000, 2000);
    animateCounter("doctors-counter", 350, 2000, "+");
    animateCounter("success-counter", 98, 2000, "%");

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          )
            .then((res) => res.json())
            .then((data) => {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state ||
                "Location not found";
              setDetectedLocation(city);
              if (!isLocationEdited) {
                setLocation(city);
              }
            })
            .catch(() => {
              setDetectedLocation("Location not found");
              if (!isLocationEdited) {
                setLocation("Location not found");
              }
            });
        },
        () => {
          setDetectedLocation("Location access denied");
          if (!isLocationEdited) {
            setLocation("Location access denied");
          }
        }
      );
    } else {
      setDetectedLocation("Geolocation not supported");
      if (!isLocationEdited) {
        setLocation("Geolocation not supported");
      }
    }
  }, [isLocationEdited]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 pt-12 bg-[#E3F2FD] text-black text-center md:text-left">
        {/* <div className="absolute inset-0 bg-gradient-radial from-blue-600 via-blue-300 to-transparent opacity-50 blur-[150px] w-[250%] h-[250%] rounded-full"></div> */}
        <div className="absolute inset-0 bg-gradient-to-l from-blue-900 via-blue-500/30 to-transparent opacity-30 blur-[100px] w-full h-full rounded-full"></div>
        <div className="relative max-w-lg md:w-1/2">
          <div className="flex flex-col h-full space-y-16">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-base md:text-lg opacity-90 mb-6 md:mb-8">
                Connecting you with trusted doctors for personalized care, anytime, anywhere.
              </p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md">
                Find Your Doctor
              </button>
            </div>
            
            {/* Counters Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center mt-12">
              <div>
                <span className="text-3xl md:text-4xl font-bold block" id="patients-counter">0K+</span>
                <p className="text-lg font-semibold mt-2">Happy Patients</p>
                <p className="text-sm text-gray-700">Thousands of satisfied patients trust us for their healthcare.</p>
              </div>
              <div>
                <span className="text-3xl md:text-4xl font-bold block" id="doctors-counter">0+</span>
                <p className="text-lg font-semibold mt-2">Specialist Doctors</p>
                <p className="text-sm text-gray-700">A team of highly skilled and experienced doctors.</p>
              </div>
              <div>
                <span className="text-3xl md:text-4xl font-bold block" id="success-counter">0%</span>
                <p className="text-lg font-semibold mt-2">Our Success Rate</p>
                <p className="text-sm text-gray-700">Providing top-tier healthcare with high success rates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Image */}
        <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
          <img
            src="/doctor-bg.png"
            className="relative rounded-lg w-64 sm:w-80 md:w-full max-w-xs md:max-w-md"
            alt="Doctor smiling"
          />
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white shadow-lg rounded-lg p-6 mx-6 md:mx-16 mt-8 text-center relative z-10">
        <h2 className="text-xl font-semibold mb-3">Find the care you need</h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Doctor, condition, procedure"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-3 rounded-lg flex-1 w-full md:w-auto"
          />

          {/* Location Input with Autocomplete */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => {
                const value = e.target.value;
                setLocation(value);
                setIsLocationEdited(true);
                fetchSuggestions(value);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              className="border p-3 rounded-lg w-full"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-left"
                    onMouseDown={() => {
                      setLocation(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search Button */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-full md:w-auto">
            Search
          </button>
        </div>
      </section>
 {/* Quick Links Section */}
 <section className="px-6 md:px-16 mt-12 bg-[#E3F2FD] py-6">
        <h2 className="text-3xl font-bold text-center mb-8">Quick Links</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative w-full md:w-1/3 bg-white shadow-xl rounded-2xl overflow-hidden transform transition duration-300 hover:scale-105">
            <img src="/appointment.png" alt="Book Appointment" className="w-full h-48 object-cover" />
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-3">Book Appointment</h3>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-full">Book Now</button>
            </div>
          </div>
          <div className="relative w-full md:w-1/3 bg-white shadow-xl rounded-2xl overflow-hidden transform transition duration-300 hover:scale-105">
            <img src="/chatai.png" alt="Chat with Chatbot" className="w-48 h-48 object-cover mx-auto" />
            <div className=" p-6 text-center">
              <h3 className="text-lg font-semibold mb-3">Chat with Chatbot</h3>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-full">Start Chat</button>
            </div>
          </div>
          <div className="relative w-full md:w-1/3 bg-white shadow-xl rounded-2xl overflow-hidden transform transition duration-300 hover:scale-105">
            <img src="/chatdoctor.png" alt="Chat with Doctor" className="w-90 h-48 object-cover mx-auto" />
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-3">Chat with Doctor</h3>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-full">Talk Now</button>
            </div>
          </div>
        </div>
      </section>
       {/* fectch upcoming uppointments  */}
      <UpcomingAppointments/>
    </>

  );
}