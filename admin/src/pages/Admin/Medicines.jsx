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
    prescriptionRequired: false
  });

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
      toast.error('Failed to fetch medicines');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/medicines', formData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
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
        prescriptionRequired: false
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add medicine');
      console.error('Error adding medicine:', error);
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
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
      console.error('Error deleting medicine:', error);
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