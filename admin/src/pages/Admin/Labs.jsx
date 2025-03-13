import  { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    services: '',
    operatingHours: '',
    accreditation: '',
    description: '',
    price: ''
  });

  // Get the admin token from localStorage
  const adminToken = localStorage.getItem('aToken');

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      const requiredFields = [
        'name', 'address', 'city', 'state', 'zipCode', 
        'phone', 'email', 'services', 'operatingHours', 
        'accreditation', 'description', 'price', 'image'
      ];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate price
      if (isNaN(formData.price) || formData.price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      await axios.post('/api/labs', formData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Lab added successfully');
      fetchLabs();
      setFormData({
        name: '',
        image: null,
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        services: '',
        operatingHours: '',
        accreditation: '',
        description: '',
        price: ''
      });
    } catch (error) {
      console.error('Error adding lab:', error);
      toast.error(error.response?.data?.message || 'Failed to add lab');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/labs/${id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      toast.success('Lab deleted successfully');
      fetchLabs();
    } catch (error) {
      console.error('Error deleting lab:', error);
      toast.error(error.response?.data?.message || 'Failed to delete lab');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Labs</h1>
      
      {/* Add Lab Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Lab</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Lab Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Operating Hours"
            value={formData.operatingHours}
            onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Accreditation"
            value={formData.accreditation}
            onChange={(e) => setFormData({...formData, accreditation: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="border p-2 rounded"
            required
          />
        </div>
        <textarea
          placeholder="Services Offered"
          value={formData.services}
          onChange={(e) => setFormData({...formData, services: e.target.value})}
          className="border p-2 rounded w-full mt-4"
          rows="3"
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="border p-2 rounded w-full mt-4"
          rows="3"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
        >
          Add Lab
        </button>
      </form>

      {/* Labs List */}
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold p-6 border-b">Labs List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">Image</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-left">Contact</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr key={lab._id} className="border-t">
                  <td className="px-6 py-4">
                    <img 
                      src={lab.image} 
                      alt={lab.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">{lab.name}</td>
                  <td className="px-6 py-4">{`${lab.city}, ${lab.state}`}</td>
                  <td className="px-6 py-4">{lab.phone}</td>
                  <td className="px-6 py-4">${lab.price}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(lab._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Labs; 