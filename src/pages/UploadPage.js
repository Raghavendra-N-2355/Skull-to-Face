import React, { useState } from "react";
import { Link } from "react-router-dom";

function UploadPage() {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center px-6 py-12">
      
      {/* Upload Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-lg text-center transform transition duration-300 hover:scale-105">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Skull Image
        </h1>
        <p className="text-gray-600 mb-6">
          Please upload a skull image to start the facial reconstruction process.
        </p>

        {/* File Input */}
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
          {image ? (
            <img
              src={image}
              alt="Preview"
              className="h-full w-auto object-contain rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h10a4 4 0 004-4m-4-4l-4-4m0 0l-4 4m4-4v12"
                />
              </svg>
              <span className="text-gray-500">Click to upload or drag & drop</span>
              <span className="text-sm text-gray-400">PNG, JPG, JPEG</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {/* Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link to="/">
            <button className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">
              ⬅ Back
            </button>
          </Link>
          <Link to="/history">
            <button
              disabled={!image}
              className={`px-6 py-2 rounded-full text-white font-semibold shadow-md transition ${
                image
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              ⚡ Reconstruct
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
