import { useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();



    return (
        <nav className="navbar">

            <div className="nav-container">

                <div
                    className="logo"
                    onClick={() => navigate("/")}
                >
                    <div className="logo-icon">👥</div>
                    <span className="logo-text">Painel de Trabalho</span>

                </div>
            </div>

        </nav>
    );
}