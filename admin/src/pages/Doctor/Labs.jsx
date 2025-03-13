import  { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('all');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await axios.get('/api/labs');
      setLabs(response.data);
      // Extract unique locations
      const uniqueLocations = [...new Set(response.data.map(lab => `${lab.city}, ${lab.state}`))];
      setLocations(uniqueLocations);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch labs');
      setLoading(false);
    }
  };

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.services.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = location === 'all' || `${lab.city}, ${lab.state}` === location;
    return matchesSearch && matchesLocation;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Laboratories Database</h1>
      
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search labs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded flex-grow"
          />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLabs.map((lab) => (
          <div key={lab._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{lab.name}</h3>
            <p className="text-gray-600 mb-2">{lab.accreditation}</p>
            <div className="space-y-2 mb-4">
              <p><span className="font-semibold">Address:</span> {lab.address}</p>
              <p><span className="font-semibold">Location:</span> {`${lab.city}, ${lab.state} ${lab.zipCode}`}</p>
              <p><span className="font-semibold">Phone:</span> {lab.phone}</p>
              <p><span className="font-semibold">Email:</span> {lab.email}</p>
              <p><span className="font-semibold">Hours:</span> {lab.operatingHours}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Services Offered:</h4>
              <p className="text-sm text-gray-600">{lab.services}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Description:</h4>
              <p className="text-sm text-gray-600">{lab.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Labs; 