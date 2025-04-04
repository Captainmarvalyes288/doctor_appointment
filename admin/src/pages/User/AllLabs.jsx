import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AllLabs = () => {
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/labs');
      setLabs(response.data);
      
      // Extract unique cities
      const uniqueCities = [...new Set(response.data.map(lab => lab.city))];
      setCities(uniqueCities);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching labs:', error);
      toast.error('Failed to fetch labs');
      setLoading(false);
    }
  };

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity ? lab.city === selectedCity : true;
    return matchesSearch && matchesCity;
  });

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Labs</h1>
      
      {/* Search and Filter */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search labs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLabs.map((lab) => (
          <div key={lab._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={lab.image} 
              alt={lab.name} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{lab.name}</h2>
              <p className="text-gray-600 mb-2">{lab.description}</p>
              <p className="text-gray-600 mb-2">{`${lab.city}, ${lab.state}`}</p>
              <p className="text-gray-600 mb-2">{lab.phone}</p>
              <p className="text-gray-600 mb-2">{lab.email}</p>
              <p className="text-gray-600 mb-2">Price: ${lab.price}</p>
              <p className="text-gray-600 mb-4">{lab.operatingHours}</p>
              
              {/* Services */}
              {lab.services && lab.services.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {lab.services.map((service, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Accreditation */}
              {lab.accreditation && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Accreditation</h3>
                  <p className="text-gray-600">{lab.accreditation}</p>
                </div>
              )}
              
              <Link
                to={`/book-lab/${lab._id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 block text-center"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {filteredLabs.length === 0 && (
        <div className="text-center text-gray-500 mt-6">
          No labs found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default AllLabs; 