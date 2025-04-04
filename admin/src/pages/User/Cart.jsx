import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map(item =>
      item._id === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (medicineId) => {
    const updatedCart = cart.filter(item => item._id !== medicineId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/all-medicines')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-start"
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-gray-600 mb-2">{item.manufacturer}</p>
                  <p className="text-gray-600 mb-2">Price: ${item.price}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="border-t border-b py-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={proceedToCheckout}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={() => navigate('/all-medicines')}
                className="mt-4 text-blue-500 hover:text-blue-700 w-full text-center"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 