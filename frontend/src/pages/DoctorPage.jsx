import React from 'react';
import useProtectProfile from '../hooks/useProtectProfile';

export default function DoctorPage() {
  useProtectProfile();
  return (
    <div>
      <h2>This is doctor page</h2>
    </div>
  );
}
