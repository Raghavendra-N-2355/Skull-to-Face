import React, { useState } from "react";

function UploadPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [image, setImage] = useState(null);

  const stages = [
    "Upload Skull Image",
    "Skull Completeness Check",
    "Skull Identification",
    "Facial Reconstruction",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setCurrentStage(1);
    }
  };

  const startProcessing = () => {
    let i = 1;
    const interval = setInterval(() => {
      if (i < stages.length) {
        setCurrentStage(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col items-center px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Skull Reconstruction Process
      </h1>
      <p className="text-gray-600 mb-10 text-lg max-w-2xl text-center">
        Follow the stages below to reconstruct a face from a skull image.
      </p>

      {/* Stage Tracker */}
      <div className="relative flex items-center justify-between w-full max-w-3xl mb-12">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300"></div>

        {/* Progress line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-600 transition-all duration-700"
          style={{
            width: `${(currentStage / (stages.length - 1)) * 100}%`,
          }}
        ></div>

        {stages.map((stage, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center flex-1"
          >
            {/* Step circle */}
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-white shadow-lg z-10
              ${index <= currentStage ? "bg-blue-600" : "bg-gray-400"}`}
            >
              {index + 1}
            </div>
            {/* Stage label */}
            <p
              className={`mt-2 text-sm font-medium text-center w-28
                ${index <= currentStage ? "text-blue-700" : "text-gray-500"}`}
            >
              {stage}
            </p>
          </div>
        ))}
      </div>

      {/* Upload Box */}
      <label className="w-full max-w-lg border-4 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer bg-white shadow-xl hover:shadow-2xl transition">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {image ? (
          <img
            src={image}
            alt="Preview"
            className="mx-auto max-h-60 rounded-lg shadow-lg"
          />
        ) : (
          <div>
            <p className="text-gray-600 text-lg">📂 Drag & Drop or Click to Upload</p>
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: JPG, PNG
            </p>
          </div>
        )}
      </label>

      {/* Start Button */}
      {image && (
        <button
          onClick={startProcessing}
          className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          🚀 Start Reconstruction
        </button>
      )}
    </div>
  );
}

export default UploadPage;
