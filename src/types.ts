export interface Palestra {
  id: string;
  titulo: string;
  vagas_totais: number;
  vagas_disponiveis: number;
  status: "aberta" | "encerrada";
  criada_em: string;
}

export interface Reserva {
  id: string;
  user_id: string;
  palestra_id: string;
  quantidade: number;
  status: "pendente" | "confirmada" | "reprovada" | "cancelada";
  expira_em: number;
}

export interface LogEntry {
  id: string;
  tipo_evento: string;
  palestra_id?: string;
  user_id?: string;
  dados?: any;
  criado_em: string;
}
