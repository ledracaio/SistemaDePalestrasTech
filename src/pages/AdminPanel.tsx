import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Palestra, Reserva } from "../types";
import { PlusCircle, Users, CheckCircle, Clock, XCircle, Activity } from "lucide-react";

// Cria conexão Socket.IO com o servidor
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const socket = io(backendUrl);

// Componente do painel administrativo
export default function AdminPanel() {
  // Estados do painel
  const [palestras, setPalestras] = useState<Palestra[]>([]); // Lista de palestras
  const [reservas, setReservas] = useState<Reserva[]>([]);    // Lista de reservas
  const [logs, setLogs] = useState<any[]>([]);               // Lista de logs de eventos
  const [novoTitulo, setNovoTitulo] = useState("");          // Input do título da nova palestra
  const [novoVagas, setNovoVagas] = useState(1);             // Input de vagas da nova palestra

  // Hook para ouvir eventos do servidor
  useEffect(() => {
    socket.on("estado.atualizado", setPalestras); // Atualiza lista de palestras
    socket.on("reservas.atualizadas", setReservas); // Atualiza lista de reservas
    socket.on("novo.log", (log) => setLogs(prev => [log, ...prev])); // Adiciona novo log no topo
    return () => {
      // Remove listeners ao desmontar componente
      socket.off("estado.atualizado", setPalestras);
      socket.off("reservas.atualizadas", setReservas);
      socket.off("novo.log");
    };
  }, []);

  // Cria nova palestra
  const handleCriarPalestra = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoTitulo.trim() && novoVagas > 0) {
      socket.emit("palestra.aberta", { titulo: novoTitulo.trim(), vagas: novoVagas });
      setNovoTitulo(""); // Limpa input de título
      setNovoVagas(1);   // Reseta número de vagas
    }
  };

  // Aprovar ou reprovar reservas
  const handleAtualizarReserva = (reservaId: string, aprovar: boolean) => {
    socket.emit("reserva.atualizar", { reservaId, aprovar });
  };

  // Filtra reservas pendentes
  const reservasPendentes = reservas.filter(r => r.status === "pendente");

  // Agrupa reservas pendentes por usuário e palestra
  const reservasAgrupadas = reservasPendentes.reduce((acc: Record<string, Reserva[]>, r) => {
    const key = `${r.user_id}-${r.palestra_id}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 flex flex-col">
      
      {/* 🔝 Barra superior */}
      <header className="bg-indigo-600 text-white shadow-md px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-yellow-300" />
          <h1 className="text-2xl font-bold tracking-wide">CharlasCheck</h1>
        </div>
        <p className="text-sm opacity-80">Painel Administrativo</p>
      </header>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        
        {/* 🧾 Criar palestra */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border-t-4 border-indigo-500">
          <h2 className="flex items-center text-xl font-semibold mb-4 text-indigo-700">
            <PlusCircle className="w-5 h-5 mr-2 text-indigo-600" /> Criar Nova Palestra
          </h2>

          {/* Formulário de criação de palestra */}
          <form onSubmit={handleCriarPalestra} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input título */}
            <div className="flex flex-col">
              <label className="font-medium text-sm text-gray-600">Título</label>
              <input
                type="text"
                value={novoTitulo}
                onChange={e => setNovoTitulo(e.target.value)}
                className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Digite o título"
                required
              />
            </div>

            {/* Input vagas */}
            <div className="flex flex-col">
              <label className="font-medium text-sm text-gray-600">Vagas</label>
              <input
                type="number"
                value={novoVagas}
                min={1}
                onChange={e => setNovoVagas(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />
            </div>

            {/* Botão criar */}
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded-lg w-full font-semibold"
              >
                Criar
              </button>
            </div>
          </form>
        </div>

        {/* 🎤 Palestras Disponíveis */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
            <Users className="w-5 h-5 mr-2 text-indigo-600" /> Palestras Disponíveis
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {palestras.length === 0 && (
              <p className="text-gray-500">Nenhuma palestra disponível.</p>
            )}
            {palestras.map(p => (
              <div
                key={p.id}
                className="bg-white shadow-md rounded-xl p-4 border-l-4 border-indigo-500"
              >
                <h3 className="font-semibold text-lg text-gray-800">{p.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Vagas: {p.vagas_disponiveis}/{p.vagas_totais}
                </p>
                <p
                  className={`text-sm mt-1 font-medium ${
                    p.status === "aberta" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Status: {p.status.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 🕒 Reservas Pendentes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
            <Clock className="w-5 h-5 mr-2 text-indigo-600" /> Reservas Pendentes
          </h2>

          {Object.values(reservasAgrupadas).length === 0 ? (
            <p className="text-gray-500">Nenhuma reserva pendente.</p>
          ) : (
            Object.values(reservasAgrupadas).map(group => {
              const palestra = palestras.find(p => p.id === group[0].palestra_id);
              return (
                <div
                  key={group[0].id}
                  className="bg-white shadow rounded-xl p-4 mb-3 border-l-4 border-yellow-500"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold">{palestra?.titulo || "Palestra"}</p>
                      <p className="text-sm text-gray-600">
                        Usuário: {group[0].user_id} — Vagas: {group.length}
                      </p>
                    </div>
                    {/* Botões aprovar/reprovar todas reservas do grupo */}
                    <div className="flex gap-2">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                        onClick={() => group.forEach(r => handleAtualizarReserva(r.id, true))}
                      >
                        <CheckCircle className="w-4 h-4" /> Aprovar
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                        onClick={() => group.forEach(r => handleAtualizarReserva(r.id, false))}
                      >
                        <XCircle className="w-4 h-4" /> Reprovar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* 🧩 Logs */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
            <Activity className="w-5 h-5 mr-2 text-indigo-600" /> Eventos Recentes
          </h2>
          <div className="bg-white shadow rounded-xl p-4 max-h-72 overflow-y-auto border border-indigo-100">
            {logs.length === 0 ? (
              <p className="text-gray-500">Nenhum evento registrado.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="border-b py-2 last:border-none">
                  <div className="text-sm text-gray-700">
                    [{new Date(log.criado_em).toLocaleTimeString()}]{" "}
                    <span className="font-semibold text-indigo-600">{log.tipo_evento}</span> —{" "}
                    Palestra: {log.palestra_id} — Usuário: {log.user_id || "-"}
                  </div>
                  {log.dados && Object.keys(log.dados).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">{JSON.stringify(log.dados)}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
