import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Palestra, Reserva } from "../types";
import { GraduationCap, ClipboardList, XCircle, Activity, LogIn } from "lucide-react";

// Cria a conexão com o servidor Socket.IO
const socket = io("http://localhost:3001");

interface ParticipantPanelProps {
  onAdminAccess: () => void; // Função chamada ao clicar no botão de acesso administrativo
}

export default function ParticipantPanel({ onAdminAccess }: ParticipantPanelProps) {
  // Estados principais do painel
  const [palestras, setPalestras] = useState<Palestra[]>([]); // Lista de palestras disponíveis
  const [reservas, setReservas] = useState<Reserva[]>([]);   // Lista de reservas do usuário
  const [userId] = useState<string>(crypto.randomUUID());    // Gera um ID único para o usuário atual
  const [quantidades, setQuantidades] = useState<Record<string, number>>({}); // Quantidade de vagas que o usuário quer reservar por palestra

  // useEffect para receber atualizações do servidor via WebSocket
  useEffect(() => {
    // Atualiza lista de palestras quando servidor envia evento
    socket.on("estado.atualizado", setPalestras);
    // Atualiza lista de reservas quando servidor envia evento
    socket.on("reservas.atualizadas", setReservas);
    // Limpa listeners ao desmontar componente
    return () => {
      socket.off("estado.atualizado", setPalestras);
      socket.off("reservas.atualizadas", setReservas);
    };
  }, []);

  // Função para solicitar reserva de vaga em uma palestra
  const handleReservar = (idPalestra: string) => {
    const quantidade = quantidades[idPalestra] || 1; // Usa quantidade definida pelo usuário ou 1 por padrão
    socket.emit("vaga.solicitada", { idPalestra, userId, quantidade });
  };

  // Função para cancelar uma reserva existente
  const handleCancelar = (reservaId: string) => {
    socket.emit("reserva.cancelar", { reservaId, userId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-indigo-100 flex flex-col">
      {/* 🔝 Barra superior */}
      <header className="bg-indigo-600 text-white shadow-md px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-yellow-300" />
          <h1 className="text-2xl font-bold tracking-wide">CharlasCheck</h1>
        </div>
        <p className="text-sm opacity-80">Painel do Participante</p>
      </header>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* 🎤 Palestras Disponíveis */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
            <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" /> Palestras Disponíveis
          </h2>

          {/* Se não houver palestras, exibe mensagem */}
          {palestras.length === 0 ? (
            <p className="text-gray-500">Nenhuma palestra disponível.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palestras.map((p) => (
                <div
                  key={p.id}
                  className="bg-white shadow-lg rounded-2xl p-5 border-t-4 border-indigo-500 flex flex-col justify-between"
                >
                  <div>
                    {/* Título da palestra */}
                    <h3 className="font-semibold text-lg text-gray-800">{p.titulo}</h3>
                    {/* Exibe quantidade de vagas disponíveis */}
                    <p className="text-sm text-gray-600 mt-1">
                      Vagas: {p.vagas_disponiveis}/{p.vagas_totais}
                    </p>
                    {/* Status da palestra (aberta ou encerrada) */}
                    <p
                      className={`text-sm mt-1 font-medium ${
                        p.status === "aberta" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Status: {p.status.toUpperCase()}
                    </p>
                  </div>

                  {/* Área para definir quantidade e reservar vagas */}
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="number"
                      min={1}
                      max={p.vagas_disponiveis} // Limita número de vagas ao disponível
                      value={quantidades[p.id] || 1} // Valor controlado pelo estado
                      onChange={(e) =>
                        setQuantidades((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))
                      }
                      className="border rounded-lg px-2 py-1 w-20 text-center focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                    <button
                      className={`flex-1 bg-indigo-600 hover:bg-indigo-700 transition text-white px-3 py-2 rounded-lg font-medium ${
                        p.vagas_disponiveis === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={p.vagas_disponiveis === 0} // Desabilita botão se não houver vagas
                      onClick={() => handleReservar(p.id)}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 🎟️ Minhas Reservas */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
            <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" /> Minhas Reservas
          </h2>

          {/* Exibe mensagem se usuário não tiver reservas */}
          {reservas.filter((r) => r.user_id === userId).length === 0 ? (
            <p className="text-gray-500">Você ainda não possui reservas.</p>
          ) : (
            reservas
              .filter((r) => r.user_id === userId)
              .slice() // cria uma cópia da lista
              .reverse() // mostra as reservas mais recentes primeiro
              .map((r) => {
                const palestra = palestras.find((p) => p.id === r.palestra_id);

                // Define cor da borda dependendo do status da reserva
                const statusClass =
                  r.status === "cancelada" || r.status === "reprovada"
                    ? "border-red-500"
                    : r.status === "confirmada"
                    ? "border-green-500"
                    : "border-purple-500";

                return (
                  <div
                    key={r.id}
                    className={`bg-white shadow-md rounded-xl p-4 mb-3 border-l-4 ${statusClass} flex justify-between items-center transition-all duration-300 hover:shadow-lg`}
                  >
                    <div>
                      {/* Nome da palestra ou ID se não encontrado */}
                      <p className="font-semibold text-gray-800">
                        {palestra?.titulo || r.palestra_id}
                      </p>
                      {/* Status da reserva com cor correspondente */}
                      <p
                        className={`text-sm font-medium ${
                          r.status === "confirmada"
                            ? "text-green-600"
                            : r.status === "cancelada" || r.status === "reprovada"
                            ? "text-red-600"
                            : "text-purple-600"
                        }`}
                      >
                        Status: {r.status}
                      </p>
                    </div>

                    {/* Botão para cancelar apenas reservas confirmadas */}
                    {r.status === "confirmada" && (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-all"
                        onClick={() => handleCancelar(r.id)}
                      >
                        <XCircle className="w-4 h-4" /> Cancelar
                      </button>
                    )}
                  </div>
                );
              })
          )}
        </section>

        {/* 🔑 Acesso Administrativo */}
        <section className="text-center mt-10">
          <button
            className="flex items-center justify-center gap-2 mx-auto text-indigo-700 hover:text-indigo-900 font-semibold underline transition"
            onClick={onAdminAccess} // Chama função passada por props para mostrar painel admin
          >
            <LogIn className="w-4 h-4" /> Acesso Administrativo
          </button>
        </section>
      </main>
    </div>
  );
}
