import { Server } from "socket.io";
import { createServer } from "http";
import crypto from "crypto";

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

// Estado em memória
let palestras = [];
let reservas = [];
let logs = [];
const admins = [{ username: "admin", password: "admin" }];

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.emit("estado.atualizado", palestras);
  socket.emit("reservas.atualizadas", reservas);
  socket.emit("sistema.iniciado");

  // LOGIN ADMIN
  socket.on("login.admin", ({ username, password }) => {
    const admin = admins.find(a => a.username === username && a.password === password);
    socket.emit("login.resultado", { success: !!admin });
  });

  // Abrir palestra (Admin)
  socket.on("palestra.aberta", ({ titulo, vagas }) => {
    const palestra = {
      id: crypto.randomUUID(),
      titulo,
      vagas_totais: vagas,
      vagas_disponiveis: vagas,
      status: "aberta",
      criada_em: new Date().toISOString(),
    };
    palestras.push(palestra);
    logEvento("palestra.aberta", palestra.id, null, { titulo, vagas });
    broadcastEstado();
  });

  // Solicitar vaga (Participante) - suporta múltiplas vagas
  socket.on("vaga.solicitada", ({ idPalestra, userId, quantidade }) => {
    const palestra = palestras.find(p => p.id === idPalestra);
    if (!palestra) return socket.emit("erro.operacao", { msg: "Palestra não encontrada" });

    if (palestra.vagas_disponiveis < quantidade) {
      socket.emit("limite.alcancado", { id: idPalestra });
      return logEvento("limite.alcancado", idPalestra, userId);
    }

    const novasReservas = [];
    for (let i = 0; i < quantidade; i++) {
      const reserva = {
        id: crypto.randomUUID(),
        palestra_id: idPalestra,
        user_id: userId,
        status: "pendente",
        expira_em: Date.now() + 60000,
      };
      reservas.push(reserva);
      novasReservas.push(reserva);
      logEvento("vaga.solicitada", idPalestra, userId, { reservaId: reserva.id });
    }

    // Bloqueia as vagas imediatamente
    palestra.vagas_disponiveis -= quantidade;

    socket.emit("vaga.recebida", { reservas: novasReservas.map(r => r.id) });
    io.emit("reserva.pendente", novasReservas);
    broadcastEstado();
  });

  // Admin aprovar/reprovar reservas (individual ou múltiplas)
  socket.on("reserva.atualizar", ({ reservaId, aprovar }) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;
    const palestra = palestras.find(p => p.id === reserva.palestra_id);
    if (!palestra) return;

    if (aprovar) {
      reserva.status = "confirmada";
      logEvento("inscricao.confirmada", palestra.id, reserva.user_id, { reservaId });
      io.emit("inscricao.confirmada", { idPalestra: palestra.id, userId: reserva.user_id, reservaId });
    } else {
      reserva.status = "reprovada";
      // Libera a vaga ao reprovar
      palestra.vagas_disponiveis++;
      logEvento("inscricao.reprovada", palestra.id, reserva.user_id, { reservaId });
      io.emit("inscricao.reprovada", { idPalestra: palestra.id, userId: reserva.user_id, reservaId });
    }

    broadcastEstado();
  });

  // Participante cancela
  socket.on("reserva.cancelar", ({ reservaId, userId }) => {
    const reserva = reservas.find(r => r.id === reservaId && r.user_id === userId);
    if (!reserva) return;

    if (reserva.status === "confirmada") {
      const palestra = palestras.find(p => p.id === reserva.palestra_id);
      if (palestra) palestra.vagas_disponiveis++;
    }

    reserva.status = "cancelada";
    logEvento("reserva.cancelada", reserva.palestra_id, userId, { reservaId });
    io.emit("reserva.cancelada", reserva);
    broadcastEstado();
  });

  // Encerrar palestra
  socket.on("sistema.encerrado", ({ idPalestra }) => {
    const palestra = palestras.find(p => p.id === idPalestra);
    if (!palestra) return;
    palestra.status = "encerrada";
    logEvento("sistema.encerrado", idPalestra);
    broadcastEstado();
  });

  socket.on("disconnect", () => console.log("Cliente desconectado:", socket.id));
});

// Função para log de eventos
function logEvento(tipo, palestraId, userId, dados = {}) {
  const evento = {
    id: crypto.randomUUID(),
    tipo_evento: tipo,
    palestra_id: palestraId,
    user_id: userId,
    dados,
    criado_em: new Date().toISOString(),
  };
  logs.push(evento);
  io.emit("novo.log", evento);
  console.log(`[${tipo}]`, dados);
}

// Emitir estado atualizado
function broadcastEstado() {
  io.emit("estado.atualizado", palestras);
  io.emit("reservas.atualizadas", reservas);
}

httpServer.listen(3001, () => console.log("Servidor Socket.IO rodando em http://localhost:3001"));
