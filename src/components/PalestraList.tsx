// Interface que define a estrutura de uma palestra
interface Palestra {
  id: string;               // ID único da palestra
  titulo: string;           // Título da palestra
  vagas_totais: number;     // Número total de vagas
  vagas_disponiveis: number; // Número de vagas ainda disponíveis
}

// Interface que define as props do componente
interface Props {
  palestras: Palestra[]; // Array de palestras para exibir
  onReserva: (palestraId: string, quantidade: number) => void; // Função callback para reservar vagas
}

// Componente que exibe a lista de palestras e permite reservas
const PalestraList = ({ palestras, onReserva }: Props) => {
  return (
    // Container principal com padding, fundo branco, sombra e cantos arredondados
    <div className="p-4 bg-white shadow rounded">
      {/* Título da seção */}
      <h2 className="font-semibold mb-2">Palestras Disponíveis</h2>

      {/* Mapeia cada palestra e exibe suas informações */}
      {palestras.map(p => (
        // Container de cada palestra com layout flex, espaçamento e borda
        <div key={p.id} className="flex justify-between items-center mb-2 p-2 border rounded">
          
          {/* Título da palestra e quantidade de vagas disponíveis/total */}
          <div>
            {p.titulo} ({p.vagas_disponiveis}/{p.vagas_totais})
          </div>

          {/* Área de interação: input para quantidade e botão de reserva */}
          <div className="flex gap-2 items-center">
            {/* Input numérico para selecionar quantidade de vagas a reservar */}
            <input 
              type="number" 
              min={1} 
              defaultValue={1} 
              className="w-16 p-1 border rounded" 
              id={`qtd-${p.id}`} // ID único baseado no ID da palestra
            />

            {/* Botão de reserva */}
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              onClick={() => {
                // Recupera o valor do input pelo ID
                const input = document.getElementById(`qtd-${p.id}`) as HTMLInputElement;
                const qtd = Number(input.value) || 1; // Converte para número e garante valor mínimo 1
                onReserva(p.id, qtd); // Chama função de reserva passando ID da palestra e quantidade
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
