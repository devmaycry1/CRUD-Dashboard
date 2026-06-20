import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import {
  MdAutoAwesome,
  MdPerson,
  MdSend,
  MdLightbulbOutline,
} from "react-icons/md";
import "./Chat.css";

export default function Chat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Olá! Sou o Personna Copilot. Como posso ajudar com a gestão da sua equipe hoje?",
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const processarMensagem = async (textoMensagem) => {
    if (!textoMensagem.trim()) return;

    const userMessage = { sender: "user", text: textoMensagem };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const resposta = await fetch(
        "https://backend-sag-50g0.onrender.com/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensagem: userMessage.text }),
        },
      );

      const data = await resposta.json();

      if (data.resposta) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.resposta },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Desculpe, não consegui obter uma resposta." },
        ]);
      }
    } catch (error) {
      console.error("Erro ao comunicar com o servidor:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Houve um erro de conexão. Verifique se o servidor backend está a funcionar.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    processarMensagem(input);
  };

  const sugestoes = [
    {
      titulo: "Resumo da Folha Salarial",
      subtitulo: "Qual é o custo total e a média salarial?",
    },
    {
      titulo: "Análise de Departamentos",
      subtitulo: "Qual setor possui a maior equipe?",
    },
    {
      titulo: "Status dos Funcionários",
      subtitulo: "Quantos colaboradores estão ativos?",
    },
  ];

  return (
    <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Header toggleSidebar={() => setIsSidebarOpen(true)} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>Assistente IA</h2>
            <p>Tire dúvidas e obtenha insights rápidos sobre os seus dados.</p>
          </div>
        </div>

        <div className="chat-dashboard-wrapper">
          <div className="chat-sidebar-suggestions">
            <div className="suggestions-header">
              <h3>
                <MdLightbulbOutline size={18} /> Sugestões Rápidas
              </h3>
            </div>
            <div className="suggestions-list">
              {sugestoes.map((sug, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() =>
                    processarMensagem(sug.titulo + " - " + sug.subtitulo)
                  }
                  disabled={isLoading}
                >
                  {sug.titulo}
                  <span>{sug.subtitulo}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="chat-main-window">
            <div className="chat-header-interno">
              <div className="ai-avatar-header">
                <MdAutoAwesome size={22} />
              </div>
              <div>
                <h3>Personna Copilot</h3>
                <p>Online e pronto a ajudar</p>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.sender}`}>
                  <div className={`message-avatar ${msg.sender}`}>
                    {msg.sender === "bot" ? (
                      <MdAutoAwesome size={18} />
                    ) : (
                      <MdPerson size={18} />
                    )}
                  </div>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}

              {isLoading && (
                <div className="message-wrapper bot">
                  <div className="message-avatar bot">
                    <MdAutoAwesome size={18} />
                  </div>
                  <div className="typing-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} className="chat-form">
                <input
                  type="text"
                  placeholder="Pergunte algo sobre os dados do sistema..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="btn-send"
                  disabled={!input.trim() || isLoading}
                >
                  <MdSend size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
