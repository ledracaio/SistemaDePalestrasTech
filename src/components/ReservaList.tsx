interface Palestra {
  id: string;
  titulo: string;
}

interface Reserva {
  id: string;
  palestra_id: string;
  user_id: string;
  status: "pendente" | "confirmada" | "cancelada";
}

interface Props {
  reservas: Reserva[];
  palestras: Palestra[];
  onCancelar: (reservaId: string) => void;
  userId: string;
}

const ReservaList = ({ reservas, palestras, onCancelar, userId }: Props) => {
  const minhasReservas = reservas.filter(r => r.user_id === userId);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-semibold mb-2">Minhas Reservas</h2>
      {minhasReservas.map(r => {
        const palestra = palestras.find(p => p.id === r.palestra_id);
        return (
          <div key={r.id} className="flex justify-between items-center mb-2 p-2 border rounded">
            <div>
              {palestra?.titulo || "Desconhecida"} - {r.status}
            </div>
            {r.status !== "cancelada" && (
              <button
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                onClick={() => onCancelar(r.id)}
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
