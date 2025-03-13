import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const navigate = useNavigate();
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('/api/medicines');
      setMedicines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch medicines');
      setLoading(false);
    }
  };

  const addToCart = (medicine) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.medicine._id === medicine._id);
      if (existingItem) {
        return prevCart.map(item =>
          item.medicine._id === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { medicine, quantity: 1 }];
    });
    setShowCart(true);
  };

  const removeFromCart = (medicineId) => {
    setCart(prevCart => prevCart.filter(item => item.medicine._id !== medicineId));
  };

  const updateQuantity = (medicineId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.medicine._id === medicineId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    try {
      const orderData = {
        medicines: cart.map(item => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
          price: item.medicine.price
        })),
        totalAmount: calculateTotal(),
        shippingAddress
      };

      await axios.post('/api/medicines/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      toast.success('Order placed successfully');
      setCart([]);
      setShowCart(false);
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Medicines</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Cart ({cart.length})
        </button>
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.medicine._id} className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{item.medicine.name}</h3>
                      <p className="text-gray-600">${item.medicine.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.medicine._id, item.quantity - 1)}
                        className="bg-gray-200 px-2 py-1 rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.medicine._id, item.quantity + 1)}
                        className="bg-gray-200 px-2 py-1 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.medicine._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <p className="font-semibold">Total: ${calculateTotal()}</p>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    className="border p-2 rounded w-full mb-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="border p-2 rounded w-full mb-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="border p-2 rounded w-full mb-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    className="border p-2 rounded w-full mb-2"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => setShowCart(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
              <p className="text-gray-600 mb-2">Stock: {medicine.stock}</p>
              <p className="text-gray-600 mb-4">
                {medicine.prescriptionRequired ? 'Prescription Required' : 'Over the Counter'}
              </p>
              <button
                onClick={() => addToCart(medicine)}
                disabled={medicine.stock === 0}
                className={`w-full px-4 py-2 rounded ${
                  medicine.stock === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medicines; 