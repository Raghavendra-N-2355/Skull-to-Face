import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<div className="p-10 text-white">Upload Page (Coming Soon)</div>} />
        <Route path="/history" element={<div className="p-10 text-white">History Page (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
