interface Palestra {
  id: string;
  titulo: string;
  vagas_totais: number;
  vagas_disponiveis: number;
}

interface Props {
  palestras: Palestra[];
  onReserva: (palestraId: string, quantidade: number) => void;
}

const PalestraList = ({ palestras, onReserva }: Props) => {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-semibold mb-2">Palestras Disponíveis</h2>
      {palestras.map(p => (
        <div key={p.id} className="flex justify-between items-center mb-2 p-2 border rounded">
          <div>
            {p.titulo} ({p.vagas_disponiveis}/{p.vagas_totais})
          </div>
          <div className="flex gap-2 items-center">
            <input type="number" min={1} defaultValue={1} className="w-16 p-1 border rounded" id={`qtd-${p.id}`} />
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              onClick={() => {
                const input = document.getElementById(`qtd-${p.id}`) as HTMLInputElement;
                const qtd = Number(input.value) || 1;
                onReserva(p.id, qtd);
              }}
            >
              Reservar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PalestraList;
