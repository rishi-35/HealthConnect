import React from 'react';
import useProtectProfile from '../hooks/useProtectProfile';
import DoctorDashboard from './DoctorDashboard';

export default function DoctorPage() {
  useProtectProfile();
  return (
    <DoctorDashboard/>
  );
}
