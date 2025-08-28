import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-cyan-400">
        🧠 Facial AI
      </Link>

      {/* Links */}
      <div className="space-x-6">
        <Link to="/" className="hover:text-cyan-400 transition">Home</Link>
        <Link to="/upload" className="hover:text-cyan-400 transition">Upload</Link>
        <Link to="/history" className="hover:text-cyan-400 transition">History</Link>
      </div>
    </nav>
  );
}
