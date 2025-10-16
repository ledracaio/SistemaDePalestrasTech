// Interface que define as props do componente
// Recebe um array de logs qualquer (any[])
interface EventLogProps {
  logs: any[];
}

// Componente React para exibir logs de eventos
export default function EventLog({ logs }: EventLogProps) {
  return (
    // Container com borda, cantos arredondados, padding
    // Limita a altura máxima e permite scroll vertical caso ultrapasse o limite
    <div className="border rounded p-2 max-h-64 overflow-y-scroll">
      {/* Mapeia cada log e exibe suas informações */}
      {logs.map(log => (
        <div key={log.id} className="mb-1 text-sm">
          {/* Exibe tipo de evento, id da palestra, id do usuário e dados em JSON */}
          [{log.tipo_evento}] Palestra: {log.palestra_id || "-"} | Usuário: {log.user_id || "-"} | {JSON.stringify(log.dados)}
        </div>
      ))}
    </div>
  );
}
