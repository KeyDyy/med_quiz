// components/AppointmentForm.tsx
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
import { toast } from 'react-toastify'
import { useUser } from "@/../hooks/useUser";
import 'react-toastify/dist/ReactToastify.css'
import { useUserAuth } from "@/lib/userAuth";

const AppointmentForm: React.FC = () => {
  const router = useRouter(); // Initialize useRouter hook
  const [patientName, setPatientName] = useState<string>('')
  const [doctorName, setDoctorName] = useState<string>('')
  const [appointmentDate, setAppointmentDate] = useState<string>('')
  const [appointmentTime, setAppointmentTime] = useState<string>('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [doctors, setDoctors] = useState<string[]>([])
  const { user } = useUser();
  useUserAuth();
  useEffect(() => {
    const fetchUserNameAndDoctors = async () => {
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (userError) {
          console.error('Error fetching user data:', userError)
        } else {
          setPatientName(userData.full_name)
        }

        const { data: doctorsData, error: doctorsError } = await supabase
          .from('users')
          .select('full_name')
          .eq('role', 'admin')

        if (doctorsError) {
          console.error('Error fetching doctors data:', doctorsError)
        } else {
          setDoctors(doctorsData.map(doctor => doctor.full_name))
        }
      }
    }

    fetchUserNameAndDoctors()
  }, [user])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (appointmentDate) {
        const { data, error } = await supabase
          .from('appointments')
          .select('appointment_date')

        if (error) {
          console.error('Error fetching appointments:', error)
        } else {
          // Filter appointments to get those on the selected date
          const selectedDateAppointments = data.filter(appointment => {
            const date = new Date(appointment.appointment_date)
            return date.toISOString().split('T')[0] === appointmentDate
          })

          const bookedTimes = selectedDateAppointments.map(appointment => {
            const time = new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return time
          })

          const allTimes = Array.from({ length: 9 }, (_, i) => `${i + 8}:00`.padStart(5, '0'))
          const available = allTimes.filter(time => !bookedTimes.includes(time))
          setAvailableTimes(available)
        }
      }
    }

    fetchAppointments()
  }, [appointmentDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        { patient_name: patientName, doctor_name: doctorName, appointment_date: appointmentDateTime },
      ])

    if (error) {
      console.error('Error creating appointment:', error)
      toast.error('Error creating appointment')
    } else {
      console.log('Appointment created:', data)
      // Reset form fields
      setDoctorName('')
      setAppointmentDate('')
      setAppointmentTime('')
      setAvailableTimes([])

      // Show notification
      toast.success('Appointment booked successfully!')

      // Redirect to homepage
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Patient Name</label>
        <input
          type="text"
          value={patientName}
          readOnly
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Doctor Name</label>
        <select
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select a doctor</option>
          {doctors.map(doctor => (
            <option key={doctor} value={doctor}>{doctor}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Appointment Date</label>
        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Appointment Time</label>
        <select
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          {availableTimes.length > 0 ? (
            availableTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))
          ) : (
            <option value="">No available times</option>
          )}
        </select>
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Book Appointment
      </button>
    </form>
  )
}

export default AppointmentForm
