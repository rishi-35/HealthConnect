import React from 'react';
import { useAuthStore } from '../store/authStore';
import EditPatientProfile from './EditPatientProfile';
import EditDoctorProfile from './EditDoctorProfile';

export default function EditProfile() {
    const {user}=useAuthStore();
  return (

    <div>
        {user.role==="patient"?<EditPatientProfile/>:<EditDoctorProfile/>}
    </div>
  );
}
