import React, { useState } from "react";

function HistoryPage() {
  // Sample history data (replace with backend later)
  const [history] = useState([
    {
      id: 1,
      date: "2025-08-28",
      skullName: "Case #101",
      iterations: [
        {
          id: 3,
          image: "https://via.placeholder.com/150",
          userPrompt: "Make skin tone lighter and refine jawline.",
          changes: "Adjusted skin tone and smoothed jaw structure.",
        },
        {
          id: 2,
          image: "https://via.placeholder.com/150",
          userPrompt: "Add medium-length straight hair.",
          changes: "Hair added with natural straight texture.",
        },
        {
          id: 1,
          image: "https://via.placeholder.com/150",
          userPrompt: "Initial reconstruction.",
          changes: "Generated base face from skull.",
        },
      ],
    },
    {
      id: 2,
      date: "2025-08-25",
      skullName: "Case #099",
      iterations: [
        {
          id: 2,
          image: "https://via.placeholder.com/150",
          userPrompt: "Improve eye shape.",
          changes: "Refined eye contours and symmetry.",
        },
        {
          id: 1,
          image: "https://via.placeholder.com/150",
          userPrompt: "Initial reconstruction.",
          changes: "Generated base structure from skull.",
        },
      ],
    },
  ]);

  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Reconstruction History
      </h1>

      <div className="max-w-5xl mx-auto space-y-6">
        {history.map((attempt) => (
          <div
            key={attempt.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden border"
          >
            {/* Attempt Header */}
            <div
              className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleExpand(attempt.id)}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {attempt.skullName}
                </h2>
                <p className="text-sm text-gray-500">{attempt.date}</p>
              </div>
              <span className="text-gray-600 font-bold text-lg">
                {expanded === attempt.id ? "▲" : "▼"}
              </span>
            </div>

            {/* Iterations List */}
            {expanded === attempt.id && (
              <div className="p-6 space-y-6 bg-gray-50">
                {attempt.iterations.map((iter) => (
                  <div
                    key={iter.id}
                    className="flex items-start gap-6 bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition"
                  >
                    {/* Image */}
                    <img
                      src={iter.image}
                      alt={`Iteration ${iter.id}`}
                      className="w-28 h-28 object-cover rounded-lg border"
                    />

                    {/* Details */}
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Iteration {iter.id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-gray-800">
                          User Prompt:
                        </span>{" "}
                        {iter.userPrompt}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-gray-800">
                          Changes:
                        </span>{" "}
                        {iter.changes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryPage;
