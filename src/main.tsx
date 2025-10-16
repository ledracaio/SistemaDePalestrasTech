import { StrictMode } from "react"; // Importa o modo estrito do React, que ajuda a identificar problemas no código
import { createRoot } from "react-dom/client"; // Importa a função para criar a raiz do React (React 18+)
import App from "./App"; // Importa o componente principal da aplicação
import "./index.css"; // Importa o arquivo de estilos globais

// Cria a raiz do React no elemento com id "root" do HTML
// O "!" é o operador non-null assertion do TypeScript, garantindo que o elemento existe
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Renderiza o componente principal dentro do StrictMode */}
    <App />
  </StrictMode>
);
