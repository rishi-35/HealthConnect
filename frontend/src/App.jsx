
import { useEffect } from 'react';
import './App.css'
import Navbar from './components/navbar'
import AuthPage from './pages/AuthPage'
import { useAuthStore } from './store/authStore';
import { Loader } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Patient from './pages/Patient';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';

function App() {
  const {user,isCheckingAuth,authCheck}= useAuthStore();
  useEffect(()=>{
    authCheck();
  },[authCheck])
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
    <Navbar/>
    <Routes>
       <Route path='/' element={<LandingPage/>}></Route>
       <Route path='/login' element={ !user?<AuthPage/>:<Navigate to={'/'}/> }></Route>
    </Routes>
    <Footer/>
    </>
  )
}

export default App
