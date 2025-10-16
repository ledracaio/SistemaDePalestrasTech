import { useState } from "react";
import { io } from "socket.io-client";
import { Lock, User } from "lucide-react";

// Cria uma conexão Socket.IO com o servidor
const socket = io("http://localhost:3001");

// Props do componente: callback chamado quando login é bem-sucedido
interface AdminLoginProps {
  onLoginSuccess: () => void;
}

// Componente de login administrativo
export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  // Estado dos inputs
  const [username, setUsername] = useState(""); // Usuário
  const [password, setPassword] = useState(""); // Senha
  const [error, setError] = useState("");       // Mensagem de erro

  // Função chamada ao submeter o formulário
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Evita reload da página
    setError("");       // Limpa erros anteriores

    // Emite evento para servidor verificar login
    socket.emit("login.admin", { username, password });

    // Escuta a resposta do servidor apenas uma vez
    socket.once("login.resultado", ({ success }: { success: boolean }) => {
      if (success) {
        onLoginSuccess(); // Chama callback de sucesso
      } else {
        setError("Usuário ou senha incorretos"); // Exibe mensagem de erro
      }
    });
  };

  return (
    // Container centralizado com gradiente de fundo
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      
      {/* Formulário com fundo semitransparente, bordas arredondadas e animação */}
      <form
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-white/20 animate-fadeIn"
        onSubmit={handleLogin}
      >
        {/* Título do painel */}
        <h1 className="text-3xl font-bold mb-6 text-center drop-shadow-md">
          Painel Administrativo
        </h1>

        {/* Campo de usuário */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Usuário</label>
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            {/* Ícone de usuário */}
            <User className="mr-2 text-white/70" size={18} />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)} // Atualiza estado
              placeholder="Digite seu usuário"
              className="w-full bg-transparent outline-none placeholder-white/50 text-white"
              required
            />
          </div>
        </div>

        {/* Campo de senha */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Senha</label>
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            {/* Ícone de cadeado */}
            <Lock className="mr-2 text-white/70" size={18} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)} // Atualiza estado
              placeholder="Digite sua senha"
              className="w-full bg-transparent outline-none placeholder-white/50 text-white"
              required
            />
          </div>
        </div>

        {/* Exibe erro caso exista */}
        {error && (
          <p className="text-red-300 text-sm mb-4 text-center animate-pulse">
            {error}
          </p>
        )}

        {/* Botão de submit */}
        <button
          className="w-full bg-white text-indigo-700 font-semibold py-2 rounded-lg mt-4 hover:bg-indigo-100 transition-all duration-300 shadow-md"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
