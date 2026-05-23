import { useNavigate, useLocation } from "react-router-dom";
import { MdSpaceDashboard, MdPeople, MdClose } from "react-icons/md";

// Recebe as props isOpen e setIsOpen
export default function Navbar({ isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {/* Fundo escuro que cobre a tela inteira. Ao clicar nele, fecha o menu */}
            <div 
                className={`sidebar-overlay ${isOpen ? "visible" : ""}`} 
                onClick={() => setIsOpen(false)}
            ></div>

            {/* A classe 'open' é injetada dinamicamente */}
            <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <img src="/Logo.png" alt="Logo" className="sidebar-logo" />
                        <h1>SAG</h1>
                    </div>
                    {/* Botão de Fechar o Menu */}
                    <button className="close-sidebar-btn" onClick={() => setIsOpen(false)}>
                        <MdClose size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div 
                        className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
                        onClick={() => { navigate("/dashboard"); setIsOpen(false); }}
                    >
                        <MdSpaceDashboard size={20} />
                        <span>Dashboard</span>
                    </div>
                    
                    <div 
                        className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
                        onClick={() => { navigate("/"); setIsOpen(false); }}
                    >
                        <MdPeople size={20} />
                        <span>Funcionários</span>
                    </div>
                </nav>
            </aside>
        </>
    );
}