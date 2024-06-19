"use client"
// components/AppointmentsList.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*');

      if (error) {
        console.error('Error fetching appointments:', error.message);
      } else {
        setAppointments(data || []);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="border border-gray-300 rounded p-4">
          <strong>Pacjent:</strong> {appointment.patient_name}<br />
          <strong>Doktor:</strong> {appointment.doctor_name}<br />
          <strong>Data:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}<br />
          <strong>Godzina:</strong> {new Date(appointment.appointment_date).toLocaleTimeString()}<br />
        </div>
      ))}
    </div>
  );
};

export default AppointmentsList;
