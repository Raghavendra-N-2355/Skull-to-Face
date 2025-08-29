import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl md:text-6xl font-extrabold text-cyan-400 drop-shadow-lg">
          AI-Powered Facial Reconstruction
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl text-gray-300">
          From incomplete skull scans to lifelike 3D faces — powered by AI & ML.
        </p>
        <Link
          to="/upload"
          className="mt-8 px-8 py-3 bg-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:bg-cyan-400 transition"
        >
          🚀 Start Reconstruction
        </Link>
      </section>

      {/* Manual Section */}
      <section className="py-16 px-8">
        <h2 className="text-3xl font-bold text-center text-purple-400 mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "1. Upload Skull 🦴", desc: "Upload 2D/3D skull image." },
            { step: "2. Validation 🔍", desc: "Check completeness + species type." },
            { step: "3. Face Reconstruction 🧑‍🦱", desc: "AI generates 3D face." },
            { step: "4. Refinement 📜", desc: "Improve traits & save history." },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-800 bg-opacity-40 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-xl font-bold text-cyan-400">{item.step}</h3>
              <p className="mt-2 text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 px-8 bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-purple-400 mb-12">
          Project Highlights
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            "AI-powered symmetry reconstruction",
            "Human vs non-human classification",
            "Iterative face refinement with traits",
            "3D visualization & history tracking",
          ].map((point, idx) => (
            <div
              key={idx}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-2xl shadow-md hover:bg-gray-700 transition"
            >
              ✔️ {point}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-20">
        <Link
          to="/upload"
          className="px-10 py-4 bg-purple-600 text-white font-bold text-lg rounded-xl shadow-xl hover:bg-purple-500 transition"
        >
          Start Your Reconstruction →
        </Link>
      </section>
    </div>
  );
}
