import { useState } from "react";
import ParticipantPanel from "./pages/ParticipantPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const [adminLogged, setAdminLogged] = useState(false);
  const [view, setView] = useState<"participant" | "admin-login" | "admin">("participant");

  const handleAdminAccess = () => setView("admin-login");
  const handleAdminLogin = () => {
    setAdminLogged(true);
    setView("admin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <main className="flex-grow">
        {view === "participant" && <ParticipantPanel onAdminAccess={handleAdminAccess} />}
        {view === "admin-login" && <AdminLogin onLoginSuccess={handleAdminLogin} />}
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
