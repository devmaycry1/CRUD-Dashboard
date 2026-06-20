import { useNavigate } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo-area">
          <svg
            className="logo-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="logo-text">Personna</span>
        </div>
        <nav className="header-nav">
          <button className="btn-enter-home" onClick={() => navigate("/home")}>
            Entrar na Home ➔
          </button>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            A Inteligência Artificial na{" "}
            <span className="highlight">Gestão</span> do seu RH
          </h1>
          <p className="hero-description">
            Monitore funcionários em tempo real, preveja necessidades de
            contratação e faça perguntas em linguagem natural diretamente para a
            sua base de dados de RH. Simples, visual e inteligente.
          </p>
          <div className="hero-actions"></div>
        </div>

        <div className="hero-image-mockup">
          <div className="mockup-window">
            <div className="mockup-header">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="mockup-body">
              <div className="chat-bubble user-bubble">
                Quantos funcionários entraram no último mês?
              </div>
              <div className="chat-bubble ai-bubble">
                No último mês, contratamos{" "}
                <strong>4 novos colaboradores</strong> para o departamento de
                TI. 📈
              </div>
              <div className="mockup-chart">
                <div className="bar" style={{ height: "40%" }}></div>
                <div className="bar" style={{ height: "60%" }}></div>
                <div className="bar" style={{ height: "30%" }}></div>
                <div className="bar" style={{ height: "80%" }}></div>
                <div className="bar" style={{ height: "50%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
