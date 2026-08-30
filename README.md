# Sistema Web Integrado de Gestão e Agendamento de UBS

Este repositório contém a implementação completa do Sistema de Gestão de Unidades Básicas de Saúde (UBS) e Portal do Paciente.

O sistema foi estruturado com uma arquitetura modular, focada em segurança, zoneamento de atendimento e controle inteligente de farmácia (com lógica FEFO).

---

## 🛠️ Arquitetura do Projeto

O projeto é dividido em:

*   **`backend/`**: API desenvolvida com **NestJS**, **TypeScript** e **Prisma ORM**. Banco de dados local configurado em **SQLite** para permitir que o sistema rode instantaneamente sem exigir dependências como Docker no Windows.
*   **`frontend/`**: Interface construída com **Vite + React**, **TypeScript** e **Tailwind CSS v4** contendo painéis dedicados a todos os perfis.

---

## 🚀 Como Iniciar

### Pré-requisitos
Certifique-se de que você possui o **Node.js (versão >= 18)** instalado em sua máquina.

### 1. Iniciar o Backend
Abra um terminal no diretório do projeto e execute:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run start
```
O backend ficará disponível na porta `3000` (`http://localhost:3000`).

*(Nota: O banco de dados SQLite já vem com uma massa de testes completa com médicos, UBSs, zoneamento, especialidades e medicamentos).*

### 2. Iniciar o Frontend
Em outro terminal no diretório do projeto, execute:
```bash
cd frontend
npm install
npm run dev
```
A interface web estará disponível em: **`http://localhost:5173/`**

---

## 🔑 Contas de Demonstração (Acesso Rápido)
Para facilitar os testes, o topo da tela de login do aplicativo exibe botões de **Acesso Rápido** que efetuam login imediato com os perfis de teste:

1.  **Paciente:** João Costa (`paciente@ubs.com` / `paciente123`)
2.  **Médico:** Dr. Carlos Silva (`medico@ubs.com` / `medico123`)
3.  **Atendente:** Atendente Maria (`atendente@ubs.com` / `atendente123`)
4.  **Farmacêutico:** Dra. Ana Ramos (`farmaceutico@ubs.com` / `farmaceutico123`)
5.  **Gestor:** Gestor Carlos (`gestor@ubs.com` / `gestor123`)
6.  **Administrador:** Administrador Geral (`admin@ubs.com` / `admin123`)

---

## 📋 Regras de Negócio Implementadas
*   **Zoneamento por Bairro:** No cadastro de paciente, a UBS de referência é determinada automaticamente a partir do bairro.
*   **Roteamento por Especialidade:** Se a UBS de referência do paciente não oferecer a especialidade escolhida, ele é encaminhado para a UBS Central.
*   **Controle Concorrência de Agendamento:** Proteção no banco de dados para evitar múltiplos agendamentos no mesmo horário/médico.
*   **Lógica FEFO na Farmácia:** Dispensação consome primeiramente os lotes de medicamentos com data de vencimento mais próxima.
*   **Reserva vs Baixa Física:** Médicos reservam o estoque ao emitir a receita; a baixa física real só ocorre no momento da dispensação do farmacêutico.
*   **Bloqueio de Lotes Vencidos:** O sistema impede que medicamentos com validade expirada sejam dispensados.
*   **Alertas de Estoque Mínimo:** Exibidos em tempo real nos dashboards gerenciais.
