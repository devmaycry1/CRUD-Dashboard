import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home/Home.jsx";
import Cadastro from "./Pages/Register/Register.jsx";
import './App.css'

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/cadastro" element={<Cadastro />} />

      </Routes>

    </BrowserRouter>
  );
}