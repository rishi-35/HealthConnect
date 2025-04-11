import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import L from "leaflet";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
// Fix for Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const containerStyle = {
  width: "100%",
  height: "280px",
};

const defaultCenter = [17.4948, 78.3996]; // Kukatpally, Hyderabad

const MapController = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
};

const EditDoctorProfile = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    specialization: "",
    hospitalLocation: { latitude: 17.4948, longitude: 78.3996 },
    gender: "",
    dateOfBirth: "",
    fee: "",
    profilePhoto: null,
    certificate: null,
    workingHours: { start: "09:00", end: "17:00" },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Fetch doctor profile from backend on mount
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/doctors/profile`,
          {
            withCredentials: true, // This is crucial for sending cookies
          }
        );
        const data = response.data;
    
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          specialization: data.specialization || "",
          hospitalLocation: {
            latitude: data.hospitalLocation?.latitude || 17.4948,
            longitude: data.hospitalLocation?.longitude || 78.3996,
          },
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth || "",
          fee: data.fee || "",
          profilePhoto: data.profilePhoto || null, // Assuming backend returns URL or null
          certificate: data.certificate || null, // Assuming backend returns URL or null
          workingHours: {
            start: data.workingHours?.start || "09:00",
            end: data.workingHours?.end || "17:00",
          },
        });
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDoctorProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fee" && value !== "" && !/^\d+$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
     
      setFormData({ ...formData, [field]: file });
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&bounded=1&viewbox=78.2,17.3,78.6,17.6`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setFormData({
      ...formData,
      hospitalLocation: { latitude: lat, longitude: lng },
      address: place.display_name || formData.address,
    });
    setSearchQuery(place.display_name);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "hospitalLocation") {
        data.append("longitude", formData.hospitalLocation.longitude);
        data.append("latitude", formData.hospitalLocation.latitude);
      } else if (key === "workingHours") {
        data.append("workingHours[start]", formData.workingHours.start);
        data.append("workingHours[end]", formData.workingHours.end);
      } else if (formData[key] instanceof File) {
        data.append(key, formData[key]);
      } else if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });
    try {
      const response = await axios.post(
        "http://localhost:5000/api/doctors/update-profile",
        data,
        {
          withCredentials: true,
        }
      );

      const result = await response.data;
   
      navigate("/");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  // Format date to dd-mm-yyyy
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, dateOfBirth: value });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg flex overflow-hidden">
        {/* Left Section - Profile Photo & Name */}
        <div className="w-1/3 bg-[#E3F2FD] p-8 flex flex-col items-center text-gray-800">
          <label className="relative cursor-pointer group w-full flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "profilePhoto")}
              className="hidden"
            />

            {formData.profilePhoto ? (
              <div className="w-48 h-48 bg-white rounded-lg border-2 border-gray-300 overflow-hidden transition-transform transform group-hover:scale-105 relative">
                <img
                  src={
                    typeof formData.profilePhoto === "string"
                      ? `http://localhost:5000${formData.profilePhoto}`
                      : formData.profilePhoto instanceof File
                      ? URL.createObjectURL(formData.profilePhoto)
                      : "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      formData.profilePhoto
                    );
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center  bg-opacity-0 group-hover:bg-opacity-40 transition-opacity  hover:bg-black/40">
                  <span className="text-white opacity-0 group-hover:opacity-100">
                    Change
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-48 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all">
                Upload Photo
              </div>
            )}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="text-2xl font-semibold text-center w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 placeholder-gray-400 text-gray-800 mt-6"
            placeholder="Enter your name"
          />
        </div>

        {/* Right Section - Form Fields */}
        <div className="w-2/3 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-medium text-gray-800">
                Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    disabled // Email might be read-only if set by auth
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-800">
                Professional Information
              </h2>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="text"
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Whole numbers only"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-800">
                Certificate Upload
              </h2>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => handleFileUpload(e, "certificate")}
                className="w-full mt-4 p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
              />
              {formData.certificate && (
                <p className="text-sm text-green-600 mt-2">
                  Certificate uploaded successfully
                </p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-800">
                Available Time
              </h2>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start"
                    value={formData.workingHours.start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHours: {
                          ...formData.workingHours,
                          start: e.target.value,
                        },
                      })
                    }
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end"
                    value={formData.workingHours.end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHours: {
                          ...formData.workingHours,
                          end: e.target.value,
                        },
                      })
                    }
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-800">
                Hospital Location
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a hospital or place"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                    {suggestions.map((place) => (
                      <li
                        key={place.place_id}
                        onClick={() => handleSelectSuggestion(place)}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 transition-colors border-b border-gray-200 last:border-b-0 truncate"
                      >
                        {place.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-4 rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                <MapContainer
                  center={defaultCenter}
                  zoom={10}
                  style={containerStyle}
                  className="h-full w-full z-10"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[
                      formData.hospitalLocation.latitude,
                      formData.hospitalLocation.longitude,
                    ]}
                    draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const lat = e.target.getLatLng().lat;
                        const lng = e.target.getLatLng().lng;
                        setFormData({
                          ...formData,
                          hospitalLocation: { latitude: lat, longitude: lng },
                        });
                      },
                    }}
                  />
                  <MapController
                    position={[
                      formData.hospitalLocation.latitude,
                      formData.hospitalLocation.longitude,
                    ]}
                  />
                </MapContainer>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Latitude: {formData.hospitalLocation.latitude.toFixed(4)},
                Longitude: {formData.hospitalLocation.longitude.toFixed(4)}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-800">
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-gray-600">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleDateChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  {formData.dateOfBirth && (
                    <p className="text-sm text-gray-600 mt-1">
                      Formatted: {formatDate(formData.dateOfBirth)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Save Information
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDoctorProfile;
