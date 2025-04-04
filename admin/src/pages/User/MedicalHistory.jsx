import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MedicalHistory = () => {
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labRecommendations, setLabRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('records');
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch medical records
      const recordsResponse = await axios.get('/api/medical-records', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      setMedicalRecords(recordsResponse.data);
      
      // Fetch prescriptions
      const prescriptionsResponse = await axios.get('/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      setPrescriptions(prescriptionsResponse.data);
      
      // Fetch lab recommendations
      const labsResponse = await axios.get('/api/lab-recommendations', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      setLabRecommendations(labsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      toast.error('Failed to fetch medical history');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Medical History</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'records' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('records')}
        >
          Medical Records
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'prescriptions' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'labs' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('labs')}
        >
          Lab Recommendations
        </button>
      </div>
      
      {/* Medical Records Tab */}
      {activeTab === 'records' && (
        <div>
          {medicalRecords.length === 0 ? (
            <p className="text-gray-500">No medical records found.</p>
          ) : (
            <div className="space-y-6">
              {medicalRecords.map((record) => (
                <div key={record._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {record.appointment?.doctor?.name || 'Doctor'}
                      </h2>
                      <p className="text-gray-500">
                        {record.appointment?.doctor?.speciality || 'Specialist'}
                      </p>
                      <p className="text-gray-500">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                    <Link
                      to={`/medical-record/${record.appointment?._id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Chief Complaint</h3>
                      <p>{record.chiefComplaint || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Vital Signs</h3>
                      <p>Height: {record.height || 'N/A'} cm</p>
                      <p>Weight: {record.weight || 'N/A'} kg</p>
                      <p>Blood Pressure: {record.bloodPressure || 'N/A'}</p>
                      <p>Temperature: {record.temperature || 'N/A'} °C</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div>
          {prescriptions.length === 0 ? (
            <p className="text-gray-500">No prescriptions found.</p>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <div key={prescription._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {prescription.doctor?.name || 'Doctor'}
                      </h2>
                      <p className="text-gray-500">
                        {prescription.doctor?.speciality || 'Specialist'}
                      </p>
                      <p className="text-gray-500">
                        {formatDate(prescription.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2">Prescribed Medications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Medication</th>
                          <th className="px-4 py-2 text-left">Dosage</th>
                          <th className="px-4 py-2 text-left">Frequency</th>
                          <th className="px-4 py-2 text-left">Duration</th>
                          <th className="px-4 py-2 text-left">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.medications.map((med, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{med.name}</td>
                            <td className="px-4 py-2">{med.dosage}</td>
                            <td className="px-4 py-2">{med.frequency}</td>
                            <td className="px-4 py-2">{med.duration}</td>
                            <td className="px-4 py-2">{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {prescription.notes && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Doctors Notes</h3>
                      <p className="text-gray-700">{prescription.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Lab Recommendations Tab */}
      {activeTab === 'labs' && (
        <div>
          {labRecommendations.length === 0 ? (
            <p className="text-gray-500">No lab recommendations found.</p>
          ) : (
            <div className="space-y-6">
              {labRecommendations.map((recommendation) => (
                <div key={recommendation._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {recommendation.doctor?.name || 'Doctor'}
                      </h2>
                      <p className="text-gray-500">
                        {recommendation.doctor?.speciality || 'Specialist'}
                      </p>
                      <p className="text-gray-500">
                        {formatDate(recommendation.createdAt)}
                      </p>
                    </div>
                    {recommendation.status !== 'completed' && (
                      <Link
                        to={`/book-lab/${recommendation._id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Book Appointment
                      </Link>
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-2">Recommended Tests</h3>
                  <ul className="list-disc pl-5 mb-4">
                    {recommendation.tests.map((test, index) => (
                      <li key={index} className="mb-1">{test}</li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      recommendation.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : recommendation.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recommendation.status.charAt(0).toUpperCase() + recommendation.status.slice(1)}
                    </span>
                  </div>
                  
                  {recommendation.notes && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Doctor Notes</h3>
                      <p className="text-gray-700">{recommendation.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory; 