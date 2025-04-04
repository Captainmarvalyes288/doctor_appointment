import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const MedicalRecord = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bloodPressure: '',
    temperature: '',
    allergies: '',
    currentMedications: '',
    pastMedicalHistory: '',
    familyMedicalHistory: '',
    chiefComplaint: '',
    symptoms: '',
    symptomDuration: '',
    additionalNotes: ''
  });

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
      fetchExistingRecord();
    } else {
      setLoading(false);
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to fetch appointment details');
      navigate('/my-appointments');
    }
  };

  const fetchExistingRecord = async () => {
    try {
      const response = await axios.get(`/api/medical-records/appointment/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (response.data) {
        setFormData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medical record:', error);
      // If 404, it means no record exists yet, which is fine
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch existing medical record');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = formData._id ? 'put' : 'post';
      const endpoint = formData._id 
        ? `/api/medical-records/${formData._id}` 
        : `/api/medical-records`;
      
      const payload = {
        ...formData,
        appointmentId
      };
      
      await axios[method](endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      toast.success('Medical record saved successfully');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast.error(error.response?.data?.message || 'Failed to save medical record');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Medical Record</h1>
      
      {appointment && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold">Appointment Details</h2>
          <p><span className="font-medium">Doctor:</span> {appointment.doctor.name}</p>
          <p><span className="font-medium">Speciality:</span> {appointment.doctor.speciality}</p>
          <p><span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
          <p><span className="font-medium">Time:</span> {appointment.time}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Health Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-1">Height (cm)</label>
            <input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Blood Pressure</label>
            <input
              type="text"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              placeholder="e.g. 120/80"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Temperature (°C)</label>
            <input
              type="text"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Medical History</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Allergies</label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows="2"
            placeholder="List any allergies you have"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Current Medications</label>
          <textarea
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows="2"
            placeholder="List any medications you are currently taking"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Past Medical History</label>
          <textarea
            name="pastMedicalHistory"
            value={formData.pastMedicalHistory}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows="3"
            placeholder="Previous illnesses, surgeries, hospitalizations, etc."
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Family Medical History</label>
          <textarea
            name="familyMedicalHistory"
            value={formData.familyMedicalHistory}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows="3"
            placeholder="Relevant family medical history"
          />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Current Symptoms</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Chief Complaint</label>
          <input
            type="text"
            name="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Main reason for visit"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Symptoms</label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows="3"
            placeholder="Describe your symptoms in detail"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Symptom Duration</label>
          <input
            type="text"
            name="symptomDuration"
            value={formData.symptomDuration}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="How long have you had these symptoms?"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Additional Notes</label>
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows="3"
            placeholder="Any other information you'd like to share with the doctor"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/my-appointments')}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Medical Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalRecord; 