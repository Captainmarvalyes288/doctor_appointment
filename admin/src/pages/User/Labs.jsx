import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await axios.get('/api/labs');
      setLabs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching labs:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch labs');
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/labs/appointments', {
        labId: selectedLab._id,
        appointmentDate
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      toast.success('Appointment booked successfully');
      setShowBookingModal(false);
      navigate('/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Available Labs</h1>
      
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
              <button
                onClick={() => {
                  setSelectedLab(lab);
                  setShowBookingModal(true);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
            <form onSubmit={handleBookAppointment}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Lab Name</label>
                <p className="text-gray-600">{selectedLab.name}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Price</label>
                <p className="text-gray-600">${selectedLab.price}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Appointment Date</label>
                <input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labs; 