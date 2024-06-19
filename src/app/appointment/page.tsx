// pages/appointments.tsx
"use client"

import Head from 'next/head'
import AppointmentForm from '../../components/AppointmentForm'

const Appointments: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Book an Appointment</title>
      </Head>
      <main>
        <AppointmentForm />
      </main>
    </div>
  )
}

export default Appointments
