import { useEffect } from 'react';
import './App.css';
import Navbar from './components/navbar';
import AuthPage from './pages/AuthPage';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Patient from './pages/Patient';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EditProfile from './pages/EditProfile';
import ShowDoctorsPage from './pages/ShowDoctorsPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import ContactUs from './pages/ContactUs';

function App() {
  const { user, isCheckingAuth, authCheck } = useAuthStore();
  // const location = useLocation();

  useEffect(() => {
    authCheck();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className='h-screen'>
        <div className='flex justify-center items-center bg-black h-full'>
          <Loader className='animate-spin text-red-600 size-10' />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/show-doctors' element={ user ?<ShowDoctorsPage/>: <Navigate to='/'/>}/>
        <Route path='/contact' element={ <ContactUs/>}/>
        <Route path='/book-appointment/:id' element={ user ?<AppointmentBookingPage/>: <Navigate to='/'/>}/>
        <Route path='/edit-profile' element={user ? <EditProfile /> : <Navigate to='/' />} />
        <Route path='/login' element={!user ? <AuthPage /> : <Navigate to='/' />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;
