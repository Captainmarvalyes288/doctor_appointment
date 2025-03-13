import  { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dosage: '',
    manufacturer: '',
    category: '',
    price: '',
    prescriptionRequired: false,
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Get the admin token from localStorage
  const adminToken = localStorage.getItem('aToken');

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
        setPreviewImage(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.dosage || 
          !formData.manufacturer || !formData.category || !formData.price || 
          !formData.image) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate price
      if (isNaN(formData.price) || formData.price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      await axios.post('/api/medicines', formData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Medicine added successfully');
      fetchMedicines();
      setFormData({
        name: '',
        description: '',
        dosage: '',
        manufacturer: '',
        category: '',
        price: '',
        prescriptionRequired: false,
        image: null
      });
      setPreviewImage(null);
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error(error.response?.data?.message || 'Failed to add medicine');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/medicines/${id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      toast.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Medicines</h1>
      
      {/* Add Medicine Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Medicine</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Medicine Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Dosage"
            value={formData.dosage}
            onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
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
            min="0"
            step="0.01"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.prescriptionRequired}
              onChange={(e) => setFormData({...formData, prescriptionRequired: e.target.checked})}
              className="mr-2"
            />
            <label>Prescription Required</label>
          </div>
        </div>
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="border p-2 rounded w-full mt-4"
          rows="3"
          required
        />
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medicine Image (Max 5MB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded w-full"
            required
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-2 h-32 w-32 object-cover rounded"
            />
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
        >
          Add Medicine
        </button>
      </form>

      {/* Medicines List */}
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold p-6 border-b">Medicines List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">Image</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Manufacturer</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine) => (
                <tr key={medicine._id} className="border-t">
                  <td className="px-6 py-4">
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">{medicine.name}</td>
                  <td className="px-6 py-4">{medicine.manufacturer}</td>
                  <td className="px-6 py-4">{medicine.category}</td>
                  <td className="px-6 py-4">${medicine.price}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(medicine._id)}
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

export default Medicines; 