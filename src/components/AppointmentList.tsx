"use client";
// components/AppointmentsList.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import Button from "./Button";
import { useUserAuth } from "@/lib/userAuth";

const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useUserAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching appointments:', error.message);
      } else {
        setAppointments(data || []);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error canceling appointment');
      console.error('Error canceling appointment:', error.message);
    } else {
      toast.success('Appointment canceled successfully');
      setAppointments(appointments.filter(appointment => appointment.id !== id));
    }
  };

  const handleFinish = async (id: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'finished' })
      .eq('id', id);

    if (error) {
      toast.error('Error finishing appointment');
      console.error('Error finishing appointment:', error.message);
    } else {
      toast.success('Appointment finished successfully');
      setAppointments(appointments.filter(appointment => appointment.id !== id));

    }
  };

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="border border-gray-300 rounded p-4">
          <strong>Pacjent:</strong> {appointment.patient_name}<br />
          <strong>Doktor:</strong> {appointment.doctor_name}<br />
          <strong>Data:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}<br />
          <strong>Godzina:</strong> {new Date(appointment.appointment_date).toLocaleTimeString()}<br />
          <div className="mt-2 flex gap-2">
            <Button
              onClick={() => handleCancel(appointment.id)}
              className="bg-white rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
            >
              Cancel
            </Button>
            <button
              onClick={() => handleFinish(appointment.id)}
              className="bg-white rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white"
            >
              Finish
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsList;
