import { useState } from "react";
import { io } from "socket.io-client";
import { Lock, User } from "lucide-react";

const socket = io("http://localhost:3001");

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    socket.emit("login.admin", { username, password });

    socket.once("login.resultado", ({ success }: { success: boolean }) => {
      if (success) {
        onLoginSuccess();
      } else {
        setError("Usuário ou senha incorretos");
      }
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      <form
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-sm text-white border border-white/20 animate-fadeIn"
        onSubmit={handleLogin}
      >
        <h1 className="text-3xl font-bold mb-6 text-center drop-shadow-md">
          Painel Administrativo
        </h1>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Usuário</label>
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            <User className="mr-2 text-white/70" size={18} />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              className="w-full bg-transparent outline-none placeholder-white/50 text-white"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Senha</label>
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            <Lock className="mr-2 text-white/70" size={18} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full bg-transparent outline-none placeholder-white/50 text-white"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-300 text-sm mb-4 text-center animate-pulse">
            {error}
          </p>
        )}

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
