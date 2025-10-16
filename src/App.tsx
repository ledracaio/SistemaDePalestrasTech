import { useState } from "react";
import ParticipantPanel from "./pages/ParticipantPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

function App() {
  // Estado que indica se o administrador está logado
  const [adminLogged, setAdminLogged] = useState(false);
  
  // Estado que controla qual "view" será exibida
  // Pode ser:
  // "participant" -> painel do participante
  // "admin-login" -> tela de login do administrador
  // "admin" -> painel administrativo
  const [view, setView] = useState<"participant" | "admin-login" | "admin">("participant");

  // Função chamada ao clicar no botão de acesso administrativo
  const handleAdminAccess = () => setView("admin-login");

  // Função chamada quando o login do administrador é bem-sucedido
  const handleAdminLogin = () => {
    setAdminLogged(true); // Marca administrador como logado
    setView("admin");     // Muda para a view do painel administrativo
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <main className="flex-grow">
        {/* Exibe o painel do participante */}
        {view === "participant" && <ParticipantPanel onAdminAccess={handleAdminAccess} />}

        {/* Exibe a tela de login do administrador */}
        {view === "admin-login" && <AdminLogin onLoginSuccess={handleAdminLogin} />}

        {/* Exibe o painel administrativo apenas se o admin estiver logado */}
        {view === "admin" && adminLogged && <AdminPanel />}
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-4">
        <p className="text-sm">
          Desenvolvido por: Caio Augusto Ledra
        </p>
        <p className="text-xs mt-1">
          Sistema de inscrição em palestras de tecnologia. Todos os direitos reservados &copy; 2025
        </p>
      </footer>
    </div>
  );
}

export default App;
