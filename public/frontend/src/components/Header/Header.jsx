import { MdSearch, MdMenu } from "react-icons/md";
import { useLocation } from "react-router-dom";
import "./Header.css"

export default function Header({ searchQuery = "", setSearchQuery = () => { }, toggleSidebar }) {
    const location = useLocation();
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const showSearch = location.pathname === "/";

    return (
        <header className="top-header">

            <button className="menu-toggle-btn" onClick={toggleSidebar}>
                <MdMenu size={26} />
            </button>

            {showSearch ? (
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
            ) : (
                <div className="header-title-block">
                    <h2>{location.pathname === "/dashboard" ? "Dashboard" : "Visão Geral"}</h2>
                    <span className="current-date">{dataAtual}</span>
                </div>
            )}
        </header>
    );
}