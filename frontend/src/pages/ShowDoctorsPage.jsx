import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdStar, MdFilterList, MdMedicalServices, MdGroups } from "react-icons/md";
const ShowDoctorsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [maxDistanceFilter, setMaxDistanceFilter] = useState(10);
  const [minRatingFilter, setMinRatingFilter] = useState('');
  const [sortByOption, setSortByOption] = useState('combinedScore');
  const [topRatedDoctors, setTopRatedDoctors] = useState([]);
  const [loadingTopRated, setLoadingTopRated] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);

  const routerLocation = useLocation();

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const searchParam = params.get('search');
    const locationParam = params.get('location');

    if (searchParam) {
      setSearchFilter(searchParam);
    } else {
      setSearchFilter('');
    }

    if (locationParam) {
      setLocationInput(locationParam);
    }
  }, [routerLocation.search]);

  // Fetch specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await axios.get('/api/doctors/specialization', { withCredentials: true });
        setSpecializations(['All Doctors', ...response.data]);
      } catch (error) {
        console.error('Error fetching specializations:', error);
      }
    };
    fetchSpecializations();
  }, []);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocation({ lat: 0, lng: 0 }); // Fallback location
      }
    );
  }, []);

  // Fetch top-rated doctors
  useEffect(() => {
    const fetchTopRated = async () => {
      setLoadingTopRated(true);
      try {
        const response = await axios.get('/api/doctors/top-rated', { withCredentials: true });
        const topDoctors = response.data.data || response.data;
        
        setTopRatedDoctors(Array.isArray(topDoctors) ? topDoctors : []);
     
      } catch (error) {
        console.error('Error fetching top-rated doctors:', error.response?.data || error.message);
        setTopRatedDoctors([]);
      } finally {
        setLoadingTopRated(false);
      }
    };
    fetchTopRated();
  }, []);

  // Handle session storage for search
  useEffect(() => {
    if (searchFilter) {
      sessionStorage.setItem('doctorSearch', searchFilter);
    } else {
      sessionStorage.removeItem('doctorSearch');
    }
  }, [searchFilter]);

  useEffect(() => {
    const savedSearch = sessionStorage.getItem('doctorSearch');
    if (savedSearch && !searchFilter) {
      setSearchFilter(savedSearch);
    } else if (!savedSearch && searchFilter === 'h') {
      setSearchFilter('');
    }
  }, []);

  // Fetch nearby doctors when dependencies change
  useEffect(() => {
    if (location) {
      fetchDoctors();
    }
  }, [location, selectedSpecialization, maxDistanceFilter, minRatingFilter, sortByOption, searchFilter, activeOnlyFilter]);
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        lng: location.lng,
        lat: location.lat,
        maxDistance: maxDistanceFilter * 1000,
        category: selectedSpecialization === 'All Doctors' ? '' : selectedSpecialization,
        available: true,
        sortBy: sortByOption,
        minRating: minRatingFilter,
        search: searchFilter,
        activeOnly: activeOnlyFilter // Already included, ensure it’s sent as 'true' or 'false'
      };
    
      const response = await axios.get('/api/doctors/nearby', {
        params,
        withCredentials: true
      });
      const fetchedDoctors = Array.isArray(response.data.data) ? response.data.data : response.data || [];
    
      setDoctors(fetchedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error.response?.data || error.message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDistanceChange = (event) => setMaxDistanceFilter(parseFloat(event.target.value) || 10);
  const handleRatingChange = (event) => setMinRatingFilter(event.target.value);
  const handleSortByChange = (event) => setSortByOption(event.target.value);
  const handleActiveOnlyChange = (event) => setActiveOnlyFilter(event.target.checked);

  const handleBookAppointment = (doctorId) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters and Specializations */}
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 lg:sticky lg:top-12 h-fit"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
              <span className="material-icons mr-2">filter_list</span>
              Filters
            </h2>
            <div className="mb-6">
              <label htmlFor="search" className="block text-blue-700 text-sm font-bold mb-2">
                Search by Name or Specialization
              </label>
              <input
                type="text"
                id="search"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="e.g., Dr. Rahul or Cardiology"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-blue-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="maxDistance" className="block text-blue-700 text-sm font-bold mb-2">
                Max Distance (km)
              </label>
              <input
                type="number"
                id="maxDistance"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-blue-700 leading-tight focus:outline-none focus:shadow-outline"
                value={maxDistanceFilter}
                onChange={handleDistanceChange}
                min="1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="minRating" className="block text-blue-700 text-sm font-bold mb-2">
                Minimum Rating
              </label>
              <select
                id="minRating"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-blue-700 leading-tight focus:outline-none focus:shadow-outline"
                value={minRatingFilter}
                onChange={handleRatingChange}
              >
                <option value="">Any</option>
                <option value="4">4 stars & above</option>
                <option value="3">3 stars & above</option>
                <option value="2">2 stars & above</option>
                <option value="1">1 star & above</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="activeOnly" className="block text-blue-700 text-sm font-bold mb-2">
                Active Doctors Only
              </label>
              <input
                type="checkbox"
                id="activeOnly"
                checked={activeOnlyFilter}
                onChange={handleActiveOnlyChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="sortBy" className="block text-blue-700 text-sm font-bold mb-2">
                Sort By
              </label>
              <select
                id="sortBy"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-blue-700 leading-tight focus:outline-none focus:shadow-outline"
                value={sortByOption}
                onChange={handleSortByChange}
              >
                <option value="combinedScore">Relevance</option>
                <option value="rating">Top Rated</option>
                <option value="distance">Nearest</option>
              </select>
            </div>

            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center mt-8">
              <MdMedicalServices title="Medical Services" />
              {/* <span className="material-icons mr-2">medical_services</span> */}
              Specializations
            </h2>
            <div className="space-y-3">
              {specializations.map((spec) => (
                <motion.button
                  key={spec}
                  whileHover={{ scale: searchFilter ? 1 : 1.02 }}
                  whileTap={{ scale: searchFilter ? 1 : 0.98 }}
                  onClick={() => !searchFilter && setSelectedSpecialization(spec)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedSpecialization === spec
                      ? 'bg-blue-600 text-white shadow-lg'
                      : searchFilter
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100 hover:shadow-md'
                  }`}
                  disabled={!!searchFilter}
                >
                  <span className="font-medium">{spec}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Doctors List */}
          <div className="lg:col-span-3">
            {/* Top Rated Doctors Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="material-icons mr-2">star</span>
                Top Rated Doctors
              </h2>
              {loadingTopRated ? (
                <div className="flex justify-center items-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : topRatedDoctors.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-yellow-600 text-center py-12 text-lg"
                >
                  No top-rated doctors found.
                </motion.p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topRatedDoctors.map((doctor) => (
                    <motion.div
                      key={doctor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-yellow-100"
                    >
                   
                      <div className="flex items-start">
                       
                      {console.log("this is doc url ", doctor.profilePhoto ? `https://healthconnect-w2m6.onrender.com${doctor.profilePhoto}` : '/defaultDoctor.jpg')}
                        <img
                          src={doctor.profilePhoto ? `https://healthconnect-w2m6.onrender.com${doctor.profilePhoto}` : '/defaultDoctor.jpg'}
                          alt={doctor.name}
                          className="w-24 h-32 rounded-md object-cover border-2 border-yellow-200 shadow-sm mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-yellow-800">{doctor.name || 'Unnamed Doctor'}</h3>
                          <p className="text-yellow-600 font-medium text-sm">{doctor.specialization || 'N/A'}</p>
                          <div className="flex items-center mt-1">
                            <span
                              className={`h-2 w-2 rounded-full mr-2 ${
                                doctor.activestatus ? 'bg-green-400 opacity-70' : 'bg-red-400 opacity-70'
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                doctor.activestatus ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {doctor.activestatus ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{doctor.gender || 'N/A'}</p>
                          <p className="text-green-600 font-semibold text-sm mt-1">₹{doctor.fee || 'N/A'}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span className="text-yellow-700 font-medium">{doctor.rating || 'N/A'}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBookAppointment(doctor._id)}
                            className="mt-2 w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-300 font-medium shadow-md text-sm"
                          >
                            Book
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Available Doctors Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h1 className="text-3xl font-bold text-blue-900 mb-8 flex items-center">
                <span className="material-icons mr-2">group</span>
                Available Doctors{' '}
                {(selectedSpecialization || searchFilter) && (
                  <span className="text-blue-600">
                    ({searchFilter || (selectedSpecialization === 'All Doctors' ? 'All' : selectedSpecialization)})
                  </span>
                )}
              </h1>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                  />
                </div>
              ) : doctors.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-blue-600 text-center py-12 text-lg"
                >
                  {selectedSpecialization || searchFilter
                    ? 'No doctors found matching your criteria.'
                    : 'Please select a specialization or search to find doctors'}
                </motion.p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {doctors.map((doctor) => (
                    <motion.div
                      key={doctor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-blue-100"
                    >
                      <div className="flex items-start">
                        <img
                          src={doctor.profilePhoto ? `https://healthconnect-w2m6.onrender.com${doctor.profilePhoto}`: '/defaultDoctor.jpg'}
                          alt={doctor.name}
                          className="w-24 h-32 rounded-md object-cover border-2 border-blue-200 shadow-sm mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-blue-900">{doctor.name || 'Unnamed Doctor'}</h3>
                          <p className="text-blue-700 font-medium text-sm">{doctor.specialization || 'N/A'}</p>
                          <div className="flex items-center mt-1">
                            <span
                              className={`h-2 w-2 rounded-full mr-2 ${
                                doctor.activestatus ? 'bg-green-400 opacity-70' : 'bg-red-400 opacity-70'
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                doctor.activestatus ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {doctor.activestatus ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{doctor.gender || 'N/A'}</p>
                          <p className="text-green-600 font-semibold text-sm mt-1">₹{doctor.fee || 'N/A'}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-blue-600 text-sm">
                              {(doctor.distanceKm || (doctor.distance / 1000)).toFixed(1)} km
                            </span>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-blue-700 font-medium">{doctor.rating || 'N/A'}</span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBookAppointment(doctor._id)}
                            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium shadow-md text-sm"
                          >
                            Book Appointment
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShowDoctorsPage;