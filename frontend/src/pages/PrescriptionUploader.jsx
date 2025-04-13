import React, { useState } from "react";
import { Link } from "react-router-dom";

const medicineDatabase = {
  "Paracetamol": {
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNEAQA8ws9_de41fCd3iTOa82dOMIDMxO1Bg&s",
    description: "Used to treat pain and fever."
  },
  "Ibuprofen": {
    image: "https://static.toiimg.com/thumb/imgsize-23456,msid-118540229,width-600,resizemode-4/118540229.jpg",
    description: "Nonsteroidal anti-inflammatory drug (NSAID)."
  },
  "Amoxicillin": {
    image: "https://5.imimg.com/data5/SELLER/Default/2024/3/395584575/PN/AA/YO/204659722/product-jpeg-3.jpg",
    description: "Antibiotic used to treat bacterial infections."
  }
};

function PrescriptionUploader() {
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setError("");
    setUploadSuccess(false);
    
    setTimeout(() => {
      setIsProcessing(false);
      setUploadSuccess(true);
      // Set static medicines data
      setMedicines(["Paracetamol", "Amoxicillin","Ibuprofen"]); // Example medicines
    }, 1500); // Simulate processing delay
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Prescription</h2>
      
      <div className="mb-6">
        <input 
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png" 
          onChange={handleFileUpload} 
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload your prescription file (PDF, JPG, PNG)
        </p>
      </div>

      {isProcessing && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Processing upload...</p>
        </div>
      )}

      {uploadSuccess && (
        <div className="text-green-600 mb-4 p-2 bg-green-50 rounded">
          File uploaded successfully!
        </div>
      )}

      {error && (
        <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</div>
      )}

      {(uploadSuccess || medicines.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recommended Medicines:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((med, index) => (
              <div key={index} className="border rounded-lg p-4 flex items-start gap-4">
                <img 
                  src={medicineDatabase[med].image} 
                  alt={med} 
                  className="w-20 h-20 object-contain border rounded" 
                />
                <div>
                  <h4 className="font-bold text-lg">{med}</h4>
                  <p className="text-gray-600 text-sm">{medicineDatabase[med].description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/" className="text-blue-600 hover:text-blue-800 mt-6 inline-block">
        ← Go Back to Home
      </Link>
    </div>
  );
}

export default PrescriptionUploader;