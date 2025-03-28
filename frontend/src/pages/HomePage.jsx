import React from 'react';
import { useAuthStore } from '../store/authStore';
import Patient from './Patient';
import AuthPage from './AuthPage';

export default function HomePage() {
    const {user}=useAuthStore();
  return (
    <div >
      {/* <h1>this is home page</h1> */}
   {user?<Patient/> :<AuthPage/>}
    </div>
  );
}
