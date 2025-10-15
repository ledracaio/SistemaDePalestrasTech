# 🚀 CharlasCheck — Sistema de Gerenciamento de Inscrições em Palestras de Tecnologia em Tempo Real

[![Desenvolvido por Caio Augusto Ledra](https://img.shields.io/badge/Desenvolvido%20por-Caio%20Augusto%20Ledra-007ACC?style=flat-square)](https://github.com/ledracaio)
[![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-green?style=flat-square)](LICENSE)
[![Frontend: React](https://img.shields.io/badge/Frontend-React%20%2B%20TS%20%2B%20TailwindCSS-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Socket.IO-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Comunicação: Socket.IO](https://img.shields.io/badge/Comunica%C3%A7%C3%A3o-Socket.IO-010101?style=flat-square&logo=socket.io)](https://socket.io/)

## ✨ Descrição do Projeto

**CharlasCheck** é uma aplicação web moderna e orientada a eventos, projetada para gerenciar o processo de inscrição em palestras de tecnologia com comunicação em **tempo real**.

A arquitetura do sistema é centrada em **WebSockets (Socket.IO)**, garantindo que todas as interações — desde a solicitação de vagas pelos participantes até a aprovação pelo administrador — sejam instantaneamente sincronizadas entre todos os clientes conectados. Este design oferece uma experiência fluida e atualizada para todos os usuários.

## 🎯 Funcionalidades Chave

### 🧑‍💻 Módulo do Participante
| Funcionalidade | Detalhes |
| :--- | :--- |
| **Visualização em Tempo Real** | Acesso à lista de palestras disponíveis e ao número exato de vagas remanescentes. |
| **Reserva de Vagas** | Submissão de solicitação de reserva para uma quantidade configurável de vagas. |
| **Acompanhamento de Status** | Monitoramento do status das reservas em tempo real: `Pendente`, `Confirmada`, `Cancelada` ou `Reprovada`. |
| **Cancelamento** | Possibilidade de cancelar reservas previamente confirmadas. |

### 🔑 Módulo Administrativo
| Funcionalidade | Detalhes |
| :--- | :--- |
| **Autenticação Segura** | Login restrito para administradores via usuário e senha. |
| **Gestão de Palestras** | Criação de novas palestras, definindo título e capacidade máxima de vagas. |
| **Controle de Reservas** | Aprovação ou reprovação eficiente de reservas pendentes (suporte a ações individuais ou em grupo). |
| **Monitoramento de Eventos** | Visualização de um *feed* de logs de eventos em tempo real, registrando todas as ações do sistema. |
| **Encerramento** | Funcionalidade para marcar palestras como encerradas. |

## 📡 Eventos do Sistema (Comunicação Socket.IO)

O coração do sistema é a comunicação assíncrona baseada em eventos, garantindo a sincronização em tempo real:

| Evento | Origem | Destino | Descrição |
| :--- | :--- | :--- | :--- |
| `sistema.iniciado` | Servidor | Clientes | Sinaliza que a aplicação backend está ativa. |
| `palestra.aberta` | Admin | Todos | Notificação da criação de uma nova palestra. |
| `vaga.solicitada` | Participante | Servidor | Requisição de reserva de vagas. |
| `vaga.recebida` | Servidor | Participante | Confirmação de que a solicitação foi processada. |
| `reserva.pendente` | Servidor | Todos | Notifica sobre a chegada de novas reservas pendentes. |
| `reserva.atualizar` | Admin | Servidor | Comando para aprovar ou reprovar reservas. |
| `inscricao.confirmada` | Servidor | Todos | Alerta de que uma inscrição foi aprovada e vagas foram preenchidas. |
| `inscricao.reprovada` | Servidor | Todos | Notifica a reprovação da inscrição e a liberação das vagas. |
| `reserva.cancelar` | Participante | Servidor | Solicita o cancelamento de uma reserva ativa. |
| `limite.alcancado` | Servidor | Participante | Aviso enviado quando a solicitação excede as vagas disponíveis. |
| `sistema.encerrado` | Admin | Todos | Marca a palestra como concluída e finaliza as inscrições. |
| `novo.log` | Servidor | Todos | Transmite um novo registro para o *log* de eventos do sistema. |

## 🏗️ Estrutura do Projeto

O projeto adota uma estrutura modular e clara para facilitar o desenvolvimento e a manutenção:


node_modules/
server/
└─ server.js
src/
├─ components/
│ ├─ EventLog.tsx
│ ├─ PalestraList.tsx
│ └─ ReservaList.tsx
├─ pages/
│ ├─ AdminLogin.tsx
│ ├─ AdminPanel.tsx
│ └─ ParticipantPanel.tsx
├─ App.tsx
├─ main.tsx
├─ types.ts
└─ index.css
.env
.gitignore
eslint.config.js
index.html
package-lock.json
package.json
postcss.config.js
README.MD
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts

## 🛠️ Instalação e Execução

Siga os passos abaixo para configurar e rodar o projeto localmente.

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em seu ambiente.

### 1. Clonar o Repositório

git clone [https://github.com/ledracaio/SistemaDePalestrasTech.git](https://github.com/ledracaio/SistemaDePalestrasTech.git)
cd SistemaDePalestrasTech

### 2. Instalar Dependências
Instale as dependências do frontend e backend:

npm install

### 3. Iniciar o Servidor Socket.IO (Backend)
Execute o backend para iniciar a comunicação em tempo real:

node server/server.js

O servidor estará acessível em http://localhost:3001.

### 4. Iniciar o Frontend
Em um novo terminal, inicie a aplicação React:

npm run dev

O frontend estará disponível em http://localhost:5173.

## 🔒 Acesso Administrativo
O acesso ao painel de gerenciamento é feito através de uma página de login dedicada, que pode ser acessada pelo link "Acesso Administrativo" localizado na parte inferior da tela principal do participante.

Para acesso em ambiente local:

1. Acesse a URL do frontend: http://localhost:5173

2. Clique no link "Acesso Administrativo".

3. Utilize as seguintes credenciais de desenvolvimento:

Usuário: admin
Senha: admin

Após o login, o administrador terá controle total sobre a criação de palestras, gerenciamento de vagas e aprovação/reprovação de reservas pendentes em tempo real.

## 📝 Observações Técnicas
- Tecnologias Frontend: Desenvolvido com React, TypeScript para tipagem forte e TailwindCSS para estilização rápida e responsiva.

- Comunicação: Utiliza Socket.IO para estabelecer canais de comunicação bidirecionais e de baixa latência.

- Observabilidade: Todas as interações críticas são registradas em tempo real através do módulo de Logs, essencial para auditoria e monitoramento do administrador.