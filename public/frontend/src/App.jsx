import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import Home from "./Pages/Home/Home.jsx";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
import Cadastro from "./Pages/Register/Register.jsx";
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" reverseOrder={false} />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>

    </BrowserRouter>
  );
}