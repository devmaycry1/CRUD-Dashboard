import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./Pages/Home/Home.jsx";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
import Cadastro from "./Pages/Register/Register.jsx";
import Landing from "./Pages/Landing/Landing.jsx";
import Chat from "./Pages/Chat/Chat.jsx";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" reverseOrder={false} />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
