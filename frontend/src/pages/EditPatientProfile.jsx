import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { CodeSquare } from "lucide-react";

const EditPatientProfile = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    healthInfo: {
      conditions: [],
      allergies: []
    },
    profilePhoto: null,
    dateOfBirth: "",
    gender: "",
    phone: "",
  });

  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch patient profile from backend on mount
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const response = await axios.get(
          `/api/patient/profile`,
          {
            withCredentials: true,
          }
        );
        const data = response.data;
       
     
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "", // Password should not be fetched
          healthInfo: {
            conditions: data.healthInfo?.conditions || [],
            allergies: data.healthInfo?.allergies || []
          },
          profilePhoto: data.profilePhoto || null,
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "", // Format date to YYYY-MM-DD
          gender: data.gender || "",
          phone: data.phone || "",
        });
      } catch (error) {
        console.error("Error fetching patient profile:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPatientProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
    }
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.healthInfo.conditions.includes(newCondition.trim())) {
      setFormData({
        ...formData,
        healthInfo: {
          ...formData.healthInfo,
          conditions: [...formData.healthInfo.conditions, newCondition.trim()]
        }
      });
      setNewCondition("");
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.healthInfo.allergies.includes(newAllergy.trim())) {
      setFormData({
        ...formData,
        healthInfo: {
          ...formData.healthInfo,
          allergies: [...formData.healthInfo.allergies, newAllergy.trim()]
        }
      });
      setNewAllergy("");
    }
  };

  const removeCondition = (condition) => {
    setFormData({
      ...formData,
      healthInfo: {
        ...formData.healthInfo,
        conditions: formData.healthInfo.conditions.filter(c => c !== condition)
      }
    });
  };

  const removeAllergy = (allergy) => {
    setFormData({
      ...formData,
      healthInfo: {
        ...formData.healthInfo,
        allergies: formData.healthInfo.allergies.filter(a => a !== allergy)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append all fields except healthInfo and profilePhoto
    Object.keys(formData).forEach((key) => {
      if (key === "healthInfo") {
        // Stringify the entire healthInfo object
        data.append(key, JSON.stringify(formData[key]));
      } else if (key !== "profilePhoto") {
        if (formData[key] !== "" && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    });
  
    // Append profilePhoto if it's a File
    if (formData.profilePhoto instanceof File) {
      data.append("profilePhoto", formData.profilePhoto);
    }
  
    try {
      const response = await axios.post(
        "/api/patient/update-profile",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      
      navigate("/");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  // Format date to dd-mm-yyyy for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg flex overflow-hidden">
        {/* Left Section - Profile Photo & Name */}
        <div className="w-1/3 bg-[#E3F2FD] p-8 flex flex-col items-center text-gray-800">
          <label className="relative cursor-pointer group w-full flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
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
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-opacity-0 group-hover:bg-opacity-40 transition-opacity hover:bg-black/40">
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
            className="text-2xl font-semibold text-center w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 mt-6"
            placeholder="Enter your name"
          />
        </div>

        {/* Right Section - Form Fields */}
        <div className="w-2/3 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-medium text-gray-800">Basic Information</h2>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    disabled
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
                  <label className="block text-sm text-gray-600">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
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

            <div>
              <h2 className="text-xl font-medium text-gray-800">Health Information</h2>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm text-gray-600">Conditions</label>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Add condition"
                    />
                    <button
                      type="button"
                      onClick={addCondition}
                      className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {formData.healthInfo.conditions.map((condition, index) => (
                      <li key={index} className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded">
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeCondition(condition)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Allergies</label>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Add allergy"
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {formData.healthInfo.allergies.map((allergy, index) => (
                      <li key={index} className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeAllergy(allergy)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
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

export default EditPatientProfile;