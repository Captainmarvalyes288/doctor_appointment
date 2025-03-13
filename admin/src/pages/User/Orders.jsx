import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PaymentModal from '../../components/PaymentModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/medicines/orders/user', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchOrders();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-left">Order ID</th>
                <th className="px-6 py-3 border-b text-left">Date</th>
                <th className="px-6 py-3 border-b text-left">Items</th>
                <th className="px-6 py-3 border-b text-left">Total Amount</th>
                <th className="px-6 py-3 border-b text-left">Status</th>
                <th className="px-6 py-3 border-b text-left">Payment Status</th>
                <th className="px-6 py-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{order._id}</td>
                  <td className="px-6 py-4 border-b">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 border-b">
                    {order.items.map((item) => (
                      <div key={item._id}>
                        {item.medicine.name} x {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 border-b">₹{order.totalAmount}</td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded ${
                      order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">
                    {order.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handlePayment(order)}
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

      {selectedOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          type="medicine-order"
          id={selectedOrder._id}
          amount={selectedOrder.totalAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Orders; 