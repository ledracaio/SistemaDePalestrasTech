interface EventLogProps {
  logs: any[];
}

export default function EventLog({ logs }: EventLogProps) {
  return (
    <div className="border rounded p-2 max-h-64 overflow-y-scroll">
      {logs.map(log => (
        <div key={log.id} className="mb-1 text-sm">
          [{log.tipo_evento}] Palestra: {log.palestra_id || "-"} | Usuário: {log.user_id || "-"} | {JSON.stringify(log.dados)}
        </div>
      ))}
    </div>
  );
}
