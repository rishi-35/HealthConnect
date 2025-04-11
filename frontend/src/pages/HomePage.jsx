import React from 'react';
import { useAuthStore } from '../store/authStore';
import Patient from './Patient';
import AuthPage from './AuthPage';
import DoctorPage from './DoctorPage';
import LandingPage from './LandingPage';

export default function HomePage() {
    const { user } = useAuthStore();
    
    console.log("This is role:", user?.role);

    return (
        <div>
            {/* <h1>This is home page</h1> */}
            {user ? (user.role == 'patient' ? <Patient /> : <DoctorPage />) : <LandingPage />}
        </div>
    );
}
