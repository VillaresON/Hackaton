# 🎓 EduFlow - Diário Escolar Offline

<div align="center">

![Status](https://img.shields.io/badge/status-concluído-success)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-6200ee?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0.33-000020?style=flat&logo=expo)
![WatermelonDB](https://img.shields.io/badge/WatermelonDB-0.28.0-green?style=flat)

**Aplicativo de gestão escolar com funcionamento 100% offline**

[Funcionalidades](#-funcionalidades) • [Tecnologias](#-tecnologias) • [Instalação](#-instalação) • [Uso](#-uso) • [Estrutura](#-estrutura-do-projeto)

</div>

---

## 📖 Sobre o Projeto

O **EduFlow** é um diário escolar completo desenvolvido para professores que necessitam gerenciar turmas, alunos, frequências e notas mesmo sem conexão com a internet. O app utiliza uma arquitetura **offline-first**, garantindo que todos os dados sejam salvos localmente e sincronizados quando houver conectividade.

### ✨ Destaques
- 📱 Funciona **100% offline** - sem dependência de internet
- ⚡ Sincronização automática quando online
- 📊 Relatórios em PDF prontos para impressão
- 🎨 Interface moderna e intuitiva
- 🔔 Feedback tátil e visual nas ações
- 👤 Perfil personalizado do professor

---

## 🚀 Funcionalidades

### 📋 Gestão de Turmas
- Criar e gerenciar múltiplas turmas
- Cadastrar alunos por turma
- Visualizar lista completa de alunos
- Excluir turmas e alunos (com confirmação)

### ✅ Chamada Diária
- **Toque rápido:** Marca aluno como **presente** (verde)
- **Toque longo:** Marca aluno como **falta** (vermelho) + vibração
- Registro automático com data/hora
- Indicador visual de status
- Remoção de registros com confirmação

### 📝 Diário de Notas
- Lançar notas de avaliações em lote
- Nomear avaliações (Ex: "Prova 1º Bimestre")
- Histórico completo de lançamentos
- Exclusão de avaliações inteiras
- Geração de **PDF de notas** para impressão

### 📅 Agenda Escolar
- Calendário interativo em português
- Agendar tarefas e provas por dia
- Vincular tarefas a turmas específicas
- Marcar tarefas como concluídas
- Indicador visual de dias com tarefas
- Exclusão de tarefas agendadas

### 👤 Perfil do Aluno
- Gráfico de pizza com frequência geral
- Porcentagem de presença calculada automaticamente
- Botão para **WhatsApp do responsável**
- Mensagem personalizada com nome do professor
- Histórico completo de frequências

### 📊 Relatórios em PDF
- **Relatório de Frequência Mensal**
  - Status de cada aluno no dia atual
  - Porcentagem de frequência do mês
  - Data de emissão e assinatura
- **Relatório de Notas**
  - Lista de alunos e suas notas
  - Nome da avaliação
  - Espaço para assinatura do professor

### ⚙️ Gestão Escolar (Admin)
- 3 abas principais:
  - **Turmas:** Criar/excluir turmas
  - **Alunos:** Matricular alunos em turmas
  - **Relatórios:** Gerar PDFs por turma
- Máscara automática para telefone
- Validação de campos obrigatórios
- Confirmação para exclusões

### 🔄 Sincronização
- Sistema offline-first com WatermelonDB
- Campo `synced` para controle de pendências
- Botão de sincronização com contador
- Simulação de envio para servidor (2s delay)
- Feedback visual de status da nuvem

### 👨‍🏫 Perfil do Professor
- Cadastro inicial com nome e gênero
- Tratamento personalizado (Professor/Professora)
- Exibição na tela inicial
- Nome em mensagens de WhatsApp
- Assinatura em relatórios

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **React Native** | 0.81.5 | Framework mobile |
| **Expo** | 54.0.33 | Plataforma de desenvolvimento |
| **WatermelonDB** | 0.28.0 | Banco de dados offline |
| **SQLite** | - | Armazenamento local |
| **React Navigation** | 7.x | Navegação entre telas |
| **AsyncStorage** | 2.2.0 | Persistência de perfil |
| **react-native-calendars** | 1.1314.0 | Calendário |
| **react-native-chart-kit** | 6.12.0 | Gráficos |
| **react-native-modal** | 14.0.0 | Modais animados |
| **expo-print** | 15.0.8 | Geração de PDF |
| **expo-sharing** | 14.0.8 | Compartilhamento de arquivos |
| **@expo/vector-icons** | 15.0.3 | Ícones Material |

---

## 📦 Instalação

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn
- Expo CLI
- Android Studio / Xcode (para emuladores)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/VillaresON/Hackaton.git

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start

# 4. Execute no emulador/dispositivo
npm run android    # Android
npm run ios        # iOS
```

---

## 📱 Uso

### Primeiro Acesso
1. Ao abrir o app, você será direcionado para a tela de **Boas-vindas**
2. Selecione como deseja ser chamado(a) (Professor/Professora)
3. Digite seu nome
4. Pronto! Você será levado para a tela inicial

### Tela Inicial
- **Turmas Ativas:** Visualiza todas as turmas cadastradas
- **Status da Nuvem:** Indicador de dados pendentes de sincronização
- **Botões de Ação:**
  - 📅 Agenda → Calendário de tarefas
  - ⚙️ Configurações → Gestão escolar
  - ☁️ Sync → Sincronizar dados

### Fazer Chamada
1. Toque em uma turma na tela inicial
2. Na lista de alunos:
   - **Toque rápido** → Presente (verde)
   - **Toque longo** → Falta (vermelho + vibração)
3. Use o botão **(i)** para ver perfil do aluno

### Lançar Notas
1. Na tela da turma, clique em **"LANÇAR NOTAS"**
2. Digite o nome da avaliação
3. Preencha as notas dos alunos
4. Clique em **SALVAR**
5. Acesse a aba **Histórico** para ver lançamentos ou gerar PDF

### Agendar Tarefas
1. Clique no botão **📅 Agenda** na home
2. Selecione uma data no calendário
3. Clique no botão **+** (flutuante)
4. Preencha título, descrição e selecione a turma
5. Confirme para agendar

### Gerar Relatórios
1. Acesse **⚙️ Configurações** (Admin)
2. Vá para a aba **Relatórios**
3. Selecione a turma desejada
4. O PDF será gerado e compartilhado automaticamente

---

## 🗂️ Estrutura do Projeto

```
EduFlow/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ConfirmModal.js
│   │   ├── StudentItem.js
│   │   └── StudentList.js
│   │
│   ├── database/            # Configuração do banco de dados
│   │   ├── model/           # Modelos WatermelonDB
│   │   │   ├── Attendance.js
│   │   │   ├── Class.js
│   │   │   ├── Grade.js
│   │   │   ├── Student.js
│   │   │   └── Task.js
│   │   ├── index.js
│   │   ├── schema.js
│   │   └── seed.js
│   │
│   ├── navigation/          # Navegação
│   │   └── AppNavigator.js
│   │
│   ├── screens/             # Telas do aplicativo
│   │   ├── AdminScreen.js
│   │   ├── AuthLoadingScreen.js
│   │   ├── CalendarScreen.js
│   │   ├── ClassScreen.js
│   │   ├── GradesScreen.js
│   │   ├── HomeScreen.js
│   │   ├── StudentProfileScreen.js
│   │   └── WelcomeScreen.js
│   │
│   └── services/            # Serviços e lógica de negócio
│       ├── AttendanceService.js
│       ├── GradeService.js
│       ├── ReportService.js
│       └── SyncService.js
│
├── assets/                  # Imagens e ícones
├── App.js                   # Componente principal
├── app.json                 # Configuração Expo
├── package.json             # Dependências
└── README.md
```

---

## 💾 Modelo de Dados

### Tabelas do Banco

#### `classes`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| name | string | Nome da disciplina |
| grade | string | Série/Ano |

#### `students`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| name | string | Nome do aluno |
| parent_phone | string | Telefone do responsável |
| class_id | string | Vínculo com turma |

#### `attendances`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| student_id | string | Vínculo com aluno |
| date | number | Timestamp da data |
| present | boolean | Presente (true) / Falta (false) |
| synced | boolean | Sincronizado com servidor |

#### `grades`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| student_id | string | Vínculo com aluno |
| description | string | Nome da avaliação |
| value | number | Nota atribuída |
| date | number | Timestamp da data |

#### `tasks`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| title | string | Título da tarefa |
| description | string | Descrição detalhada |
| date | string | Data (YYYY-MM-DD) |
| class_id | string | Vínculo com turma |
| is_done | boolean | Concluída (true/false) |

---
## 👨‍💻 Autor

<div align="center">

**Desenvolvido por VillaresOn**

📧 Entre em contato: [canalvillares@gmail.com](mailto:canalvillares@gmail.com)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/jonathasvillares/)
[![GitHub](https://img.shields.io/badge/GitHub-Perfil-black?style=flat&logo=github)](https://github.com/VillaresON/)

</div>

---

<div align="center">

**Feito com ❤️ para a educação**

</div>
