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
                    <div className="logo-icon"><img width="36" height="36" src="https://img.icons8.com/external-flatarticons-blue-flatarticons/65/external-employee-work-from-home-flatarticons-blue-flatarticons-1.png" alt="external-employee-work-from-home-flatarticons-blue-flatarticons-1"/></div>
                    <span className="logo-text">Painel de Trabalho</span>

                </div>
            </div>

        </nav>
    );
}