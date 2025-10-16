import { Server } from "socket.io";
import { createServer } from "http";
import crypto from "crypto";

// Cria um servidor HTTP básico
const httpServer = createServer();
// Cria um servidor Socket.IO com CORS liberado para qualquer origem
const io = new Server(httpServer, { cors: { origin: "*" } });

// Estado em memória
let palestras = []; // Lista de palestras disponíveis
let reservas = [];  // Lista de reservas feitas pelos participantes
let logs = [];      // Lista de logs de eventos
const admins = [{ username: "admin", password: "admin" }]; // Usuários administradores

// Evento disparado quando um cliente se conecta
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Envia o estado atual ao cliente recém-conectado
  socket.emit("estado.atualizado", palestras);
  socket.emit("reservas.atualizadas", reservas);
  socket.emit("sistema.iniciado");

  // LOGIN ADMIN
  socket.on("login.admin", ({ username, password }) => {
    // Verifica se o usuário e senha correspondem a algum admin
    const admin = admins.find(a => a.username === username && a.password === password);
    // Retorna se o login foi bem-sucedido
    socket.emit("login.resultado", { success: !!admin });
  });

  // Abrir palestra (Admin)
  socket.on("palestra.aberta", ({ titulo, vagas }) => {
    const palestra = {
      id: crypto.randomUUID(),          // ID único da palestra
      titulo,
      vagas_totais: vagas,              // Total de vagas disponíveis
      vagas_disponiveis: vagas,         // Vagas ainda disponíveis
      status: "aberta",                 // Status inicial
      criada_em: new Date().toISOString(),
    };
    palestras.push(palestra);
    logEvento("palestra.aberta", palestra.id, null, { titulo, vagas }); // Registra evento
    broadcastEstado(); // Atualiza todos os clientes
  });

  // Solicitar vaga (Participante) - suporta múltiplas vagas
  socket.on("vaga.solicitada", ({ idPalestra, userId, quantidade }) => {
    const palestra = palestras.find(p => p.id === idPalestra);
    if (!palestra) return socket.emit("erro.operacao", { msg: "Palestra não encontrada" });

    // Verifica se há vagas suficientes
    if (palestra.vagas_disponiveis < quantidade) {
      socket.emit("limite.alcancado", { id: idPalestra });
      return logEvento("limite.alcancado", idPalestra, userId);
    }

    const novasReservas = [];
    // Cria reservas individuais
    for (let i = 0; i < quantidade; i++) {
      const reserva = {
        id: crypto.randomUUID(),
        palestra_id: idPalestra,
        user_id: userId,
        status: "pendente",        // Status inicial
        expira_em: Date.now() + 60000, // Expira em 60 segundos
      };
      reservas.push(reserva);
      novasReservas.push(reserva);
      logEvento("vaga.solicitada", idPalestra, userId, { reservaId: reserva.id });
    }

    // Bloqueia as vagas imediatamente
    palestra.vagas_disponiveis -= quantidade;

    // Envia confirmação ao participante e atualiza todos
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
      reserva.status = "confirmada"; // Aprova a reserva
      logEvento("inscricao.confirmada", palestra.id, reserva.user_id, { reservaId });
      io.emit("inscricao.confirmada", { idPalestra: palestra.id, userId: reserva.user_id, reservaId });
    } else {
      reserva.status = "reprovada";  // Reprova a reserva
      palestra.vagas_disponiveis++;  // Libera a vaga
      logEvento("inscricao.reprovada", palestra.id, reserva.user_id, { reservaId });
      io.emit("inscricao.reprovada", { idPalestra: palestra.id, userId: reserva.user_id, reservaId });
    }

    broadcastEstado();
  });

  // Participante cancela
  socket.on("reserva.cancelar", ({ reservaId, userId }) => {
    const reserva = reservas.find(r => r.id === reservaId && r.user_id === userId);
    if (!reserva) return;

    // Se a reserva estava confirmada, libera a vaga
    if (reserva.status === "confirmada") {
      const palestra = palestras.find(p => p.id === reserva.palestra_id);
      if (palestra) palestra.vagas_disponiveis++;
    }

    reserva.status = "cancelada"; // Marca como cancelada
    logEvento("reserva.cancelada", reserva.palestra_id, userId, { reservaId });
    io.emit("reserva.cancelada", reserva);
    broadcastEstado();
  });

  // Encerrar palestra
  socket.on("sistema.encerrado", ({ idPalestra }) => {
    const palestra = palestras.find(p => p.id === idPalestra);
    if (!palestra) return;
    palestra.status = "encerrada"; // Atualiza status da palestra
    logEvento("sistema.encerrado", idPalestra);
    broadcastEstado();
  });

  // Evento de desconexão
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
  logs.push(evento);       // Adiciona ao array de logs
  io.emit("novo.log", evento); // Emite log para todos os clientes conectados
  console.log(`[${tipo}]`, dados); // Loga no servidor
}

// Emitir estado atualizado
function broadcastEstado() {
  io.emit("estado.atualizado", palestras);  // Atualiza lista de palestras
  io.emit("reservas.atualizadas", reservas); // Atualiza lista de reservas
}

// Inicia servidor na porta 3001
httpServer.listen(process.env.PORT || 3001, () => console.log("Servidor Socket.IO rodando em http://localhost:3001"));
