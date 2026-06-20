import { useNavigate, useLocation } from "react-router-dom";
import {
  MdSpaceDashboard,
  MdPeople,
  MdClose,
  MdAutoAwesome,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import "./Navbar.css";

export default function Navbar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg
              className="sidebar-logo-svg"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#logo-gradient)" /* Aponta para o gradiente abaixo */
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Definição do Gradiente Azul */}
              <defs>
                <linearGradient
                  id="logo-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00288e" /> {/* Cor Primária */}
                  <stop offset="100%" stopColor="#3b82f6" /> {/* Azul Claro */}
                </linearGradient>
              </defs>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <h1>Personna</h1>
          </div>
          <button
            className="close-sidebar-btn"
            onClick={() => setIsOpen(false)}
          >
            <MdClose size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div
            className={isActive("/dashboard")}
            onClick={() => {
              navigate("/dashboard");
              setIsOpen(false);
            }}
          >
            <MdSpaceDashboard size={20} />
            <span>Dashboard</span>
          </div>

          <div
            className={isActive("/home")}
            onClick={() => {
              navigate("/home");
              setIsOpen(false);
            }}
          >
            <MdPeople size={20} />
            <span>Funcionários</span>
          </div>

          <div
            className={`${isActive("/chat")} nav-item-ai`}
            onClick={() => {
              navigate("/chat");
              setIsOpen(false);
            }}
          >
            <MdAutoAwesome size={20} />
            <span>Assistente IA</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="utility-links">
            <div className="nav-item utility">
              <MdSettings size={20} />
              <span>Configurações</span>
            </div>
          </div>

          <div className="user-profile-card">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <span className="user-name">Administrador</span>
              <span className="user-role">Recursos Humanos</span>
            </div>
            <button
              className="logout-btn"
              onClick={() => {
                navigate("/"); 
                setIsOpen(false); 
              }}
              title="Sair do sistema"
            >
              <MdLogout size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
