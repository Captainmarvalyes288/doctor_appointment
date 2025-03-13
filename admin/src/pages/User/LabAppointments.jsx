import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PaymentModal from '../../components/PaymentModal';

const LabAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/labs/appointments/user', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchAppointments();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Lab Appointments</h1>
      
      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-left">Appointment ID</th>
                <th className="px-6 py-3 border-b text-left">Lab</th>
                <th className="px-6 py-3 border-b text-left">Date</th>
                <th className="px-6 py-3 border-b text-left">Time</th>
                <th className="px-6 py-3 border-b text-left">Amount</th>
                <th className="px-6 py-3 border-b text-left">Status</th>
                <th className="px-6 py-3 border-b text-left">Payment Status</th>
                <th className="px-6 py-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{appointment._id}</td>
                  <td className="px-6 py-4 border-b">{appointment.lab.name}</td>
                  <td className="px-6 py-4 border-b">
                    {new Date(appointment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 border-b">{appointment.time}</td>
                  <td className="px-6 py-4 border-b">₹{appointment.amount}</td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded ${
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded ${
                      appointment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">
                    {appointment.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handlePayment(appointment)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAppointment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          type="lab-appointment"
          id={selectedAppointment._id}
          amount={selectedAppointment.amount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default LabAppointments; 