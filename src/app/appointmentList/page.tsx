// pages/index.tsx (przykład użycia na stronie głównej)
import AppointmentsList from '../../components/AppointmentList'

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Terminarz wizyt</h1>
      <p className="text-lg mb-8">Umówione wizyty.</p>
      <AppointmentsList />
    </div>
  );
};

export default HomePage;
