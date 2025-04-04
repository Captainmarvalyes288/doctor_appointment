import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AllMedicines = () => {
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/medicines');
      setMedicines(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(med => med.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to fetch medicines');
      setLoading(false);
    }
  };

  const addToCart = (medicine) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === medicine._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...medicine, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const removeFromCart = (medicineId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== medicineId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === medicineId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? medicine.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="lg:w-3/4">
          <h1 className="text-2xl font-bold mb-6">All Medicines</h1>
          
          {/* Search and Filter */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Medicines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => (
              <div key={medicine._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={medicine.image} 
                  alt={medicine.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{medicine.name}</h2>
                  <p className="text-gray-600 mb-2">{medicine.description}</p>
                  <p className="text-gray-600 mb-2">Manufacturer: {medicine.manufacturer}</p>
                  <p className="text-gray-600 mb-2">Price: ${medicine.price}</p>
                  <p className="text-gray-600 mb-4">
                    {medicine.prescriptionRequired ? 'Prescription Required' : 'Over the Counter'}
                  </p>
                  
                  <button
                    onClick={() => addToCart(medicine)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMedicines.length === 0 && (
            <div className="text-center text-gray-500 mt-6">
              No medicines found matching your criteria.
            </div>
          )}
        </div>
        
        {/* Cart Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-2 mb-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">${item.price}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-100 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={proceedToCheckout}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMedicines; 