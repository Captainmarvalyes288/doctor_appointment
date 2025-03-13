import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/labs/appointments/user', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      // Here you would integrate with your payment gateway
      // For now, we'll just update the payment status
      await axios.put(`/api/labs/appointments/${appointmentId}/status`, {
        paymentStatus: 'completed',
        status: 'confirmed'
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      toast.success('Payment completed successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left">Lab Name</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Payment</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id} className="border-t">
                <td className="px-6 py-4">{appointment.lab.name}</td>
                <td className="px-6 py-4">
                  {new Date(appointment.appointmentDate).toLocaleString()}
                </td>
                <td className="px-6 py-4">${appointment.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    appointment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {appointment.paymentStatus === 'pending' && (
                    <button
                      onClick={() => handlePayment(appointment._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
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
    </div>
  );
};

export default Appointments; 