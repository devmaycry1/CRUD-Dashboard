import { MdSearch, MdMenu } from "react-icons/md";
import { useLocation } from "react-router-dom";
import "./Header.css";

export default function Header({
  searchQuery = "",
  setSearchQuery = () => {},
  toggleSidebar,
}) {
  const location = useLocation();

  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/chat":
        return "Assistente";
      case "/home":
        return "Visão Geral";
      case "/cadastro":
        return "Cadastro"  
    }
  };

  const showSearch = location.pathname === "/home";

  return (
    <header className="top-header">
      <button className="menu-toggle-btn" onClick={toggleSidebar}>
        <MdMenu size={26} />
      </button>

      <div className="header-title-block">
        <h2>{getTitle()}</h2>
        <span className="current-date">{dataAtual}</span>
      </div>

      {showSearch && (
        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar funcionários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
    </header>
  );
}
