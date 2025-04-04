import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch labs
      const labsResponse = await axios.get('/api/labs');
      setLabs(labsResponse.data);
      
      // Fetch medicines
      const medicinesResponse = await axios.get('/api/medicines');
      setMedicines(medicinesResponse.data);
      
      // Fetch upcoming appointments
      const appointmentsResponse = await axios.get('/api/appointments/upcoming', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      setAppointments(appointmentsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Health Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'labs' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('labs')}
        >
          Labs
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'medicines' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('medicines')}
        >
          Medicines
        </button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Upcoming Appointments */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <Link to="/my-appointments" className="text-blue-500 hover:text-blue-700">
                View All
              </Link>
            </div>
            
            {appointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold">{appointment.doctor?.name || 'Doctor'}</h3>
                    <p className="text-gray-600">{appointment.doctor?.speciality || 'Specialist'}</p>
                    <p className="text-gray-600">Date: {formatDate(appointment.date)}</p>
                    <p className="text-gray-600">Time: {appointment.time}</p>
                    <div className="mt-2">
                      <Link 
                        to={`/medical-record/${appointment._id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Update Medical Record
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/medical-history"
                className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600"
              >
                View Medical History
              </Link>
              <Link 
                to="/labs"
                className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600"
              >
                Book Lab Test
              </Link>
              <Link 
                to="/medicines"
                className="bg-purple-500 text-white p-4 rounded-lg text-center hover:bg-purple-600"
              >
                Order Medicines
              </Link>
            </div>
          </div>
          
          {/* Featured Labs and Medicines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Featured Labs</h2>
                <button 
                  onClick={() => setActiveTab('labs')}
                  className="text-blue-500 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              
              {labs.slice(0, 2).map((lab) => (
                <div key={lab._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <div className="flex">
                    <img 
                      src={lab.image} 
                      alt={lab.name} 
                      className="w-20 h-20 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="font-semibold">{lab.name}</h3>
                      <p className="text-gray-600">{`${lab.city}, ${lab.state}`}</p>
                      <p className="text-gray-600">Price: ${lab.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Featured Medicines</h2>
                <button 
                  onClick={() => setActiveTab('medicines')}
                  className="text-blue-500 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              
              {medicines.slice(0, 2).map((medicine) => (
                <div key={medicine._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <div className="flex">
                    <img 
                      src={medicine.image} 
                      alt={medicine.name} 
                      className="w-20 h-20 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="font-semibold">{medicine.name}</h3>
                      <p className="text-gray-600">{medicine.manufacturer}</p>
                      <p className="text-gray-600">Price: ${medicine.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Labs Tab */}
      {activeTab === 'labs' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">All Labs</h2>
            <p className="text-gray-500">Find and book appointments at top labs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab) => (
              <div key={lab._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={lab.image} 
                  alt={lab.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{lab.name}</h2>
                  <p className="text-gray-600 mb-2">{`${lab.city}, ${lab.state}`}</p>
                  <p className="text-gray-600 mb-2">{lab.phone}</p>
                  <p className="text-gray-600 mb-2">{lab.email}</p>
                  <p className="text-gray-600 mb-2">Price: ${lab.price}</p>
                  <p className="text-gray-600 mb-4">{lab.operatingHours}</p>
                  <Link
                    to={`/book-lab/${lab._id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 block text-center"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Medicines Tab */}
      {activeTab === 'medicines' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">All Medicines</h2>
            <p className="text-gray-500">Browse and order medicines online</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <div key={medicine._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={medicine.image} 
                  alt={medicine.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{medicine.name}</h2>
                  <p className="text-gray-600 mb-2">{medicine.description}</p>
                  <p className="text-gray-600 mb-2">Price: ${medicine.price}</p>
                  <p className="text-gray-600 mb-2">Manufacturer: {medicine.manufacturer}</p>
                  <p className="text-gray-600 mb-4">
                    {medicine.prescriptionRequired ? 'Prescription Required' : 'Over the Counter'}
                  </p>
                  <Link
                    to="/medicines"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 block text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 