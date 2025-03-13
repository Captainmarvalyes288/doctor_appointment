import  { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('/api/medicines');
      setMedicines(response.data);
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(medicine => medicine.category))];
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch medicines');
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || medicine.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Medicines Database</h1>
      
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded flex-grow"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => (
          <div key={medicine._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{medicine.name}</h3>
            <p className="text-gray-600 mb-2">{medicine.manufacturer}</p>
            <p className="text-sm text-gray-500 mb-4">{medicine.description}</p>
            <div className="space-y-2">
              <p><span className="font-semibold">Dosage:</span> {medicine.dosage}</p>
              <p><span className="font-semibold">Category:</span> {medicine.category}</p>
              <p><span className="font-semibold">Price:</span> ${medicine.price}</p>
              <p>
                <span className="font-semibold">Prescription Required:</span>{' '}
                {medicine.prescriptionRequired ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medicines; 