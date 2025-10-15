import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Palestra, Reserva } from "../types";
import { GraduationCap, ClipboardList, XCircle, Activity, LogIn } from "lucide-react";

const socket = io("http://localhost:3001");

interface ParticipantPanelProps {
  onAdminAccess: () => void;
}

export default function ParticipantPanel({ onAdminAccess }: ParticipantPanelProps) {
  const [palestras, setPalestras] = useState<Palestra[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [userId] = useState<string>(crypto.randomUUID());
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  useEffect(() => {
    socket.on("estado.atualizado", setPalestras);
    socket.on("reservas.atualizadas", setReservas);
    return () => {
      socket.off("estado.atualizado", setPalestras);
      socket.off("reservas.atualizadas", setReservas);
    };
  }, []);

  const handleReservar = (idPalestra: string) => {
    const quantidade = quantidades[idPalestra] || 1;
    socket.emit("vaga.solicitada", { idPalestra, userId, quantidade });
  };

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

                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="number"
                      min={1}
                      max={p.vagas_disponiveis}
                      value={quantidades[p.id] || 1}
                      onChange={(e) =>
                        setQuantidades((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))
                      }
                      className="border rounded-lg px-2 py-1 w-20 text-center focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                    <button
                      className={`flex-1 bg-indigo-600 hover:bg-indigo-700 transition text-white px-3 py-2 rounded-lg font-medium ${
                        p.vagas_disponiveis === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={p.vagas_disponiveis === 0}
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

          {reservas.filter((r) => r.user_id === userId).length === 0 ? (
            <p className="text-gray-500">Você ainda não possui reservas.</p>
          ) : (
            reservas
              .filter((r) => r.user_id === userId)
              .slice() // cria uma cópia
              .reverse() // inverte a ordem
              .map((r) => {
                const palestra = palestras.find((p) => p.id === r.palestra_id);

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
                      <p className="font-semibold text-gray-800">
                        {palestra?.titulo || r.palestra_id}
                      </p>
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
            onClick={onAdminAccess}
          >
            <LogIn className="w-4 h-4" /> Acesso Administrativo
          </button>
        </section>
      </main>
    </div>
  );
}
