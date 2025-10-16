// Interface que define a estrutura de uma palestra
interface Palestra {
  id: string;      // ID único da palestra
  titulo: string;  // Título da palestra
}

// Interface que define a estrutura de uma reserva
interface Reserva {
  id: string;                  // ID único da reserva
  palestra_id: string;          // ID da palestra associada
  user_id: string;              // ID do usuário que fez a reserva
  status: "pendente" | "confirmada" | "cancelada"; // Status da reserva
}

// Interface das props do componente
interface Props {
  reservas: Reserva[];                // Lista de todas as reservas
  palestras: Palestra[];              // Lista de todas as palestras
  onCancelar: (reservaId: string) => void; // Função para cancelar uma reserva
  userId: string;                     // ID do usuário atual
}

// Componente que exibe a lista de reservas do usuário
const ReservaList = ({ reservas, palestras, onCancelar, userId }: Props) => {
  // Filtra apenas as reservas do usuário logado
  const minhasReservas = reservas.filter(r => r.user_id === userId);

  return (
    // Container principal com padding, fundo branco, sombra e cantos arredondados
    <div className="p-4 bg-white shadow rounded">
      {/* Título da seção */}
      <h2 className="font-semibold mb-2">Minhas Reservas</h2>

      {/* Mapeia cada reserva do usuário */}
      {minhasReservas.map(r => {
        // Busca a palestra correspondente à reserva
        const palestra = palestras.find(p => p.id === r.palestra_id);

        return (
          // Container de cada reserva com layout flex, espaçamento e borda
          <div key={r.id} className="flex justify-between items-center mb-2 p-2 border rounded">
            
            {/* Exibe o título da palestra e o status da reserva */}
            <div>
              {palestra?.titulo || "Desconhecida"} - {r.status}
            </div>

            {/* Botão de cancelar apenas se a reserva não estiver cancelada */}
            {r.status !== "cancelada" && (
              <button
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                onClick={() => onCancelar(r.id)} // Chama callback de cancelamento
              >
                Cancelar
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReservaList;
