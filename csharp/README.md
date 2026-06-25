# 🚀 Finança AI Ultimate - Edição C# (.NET 8)

Esta pasta contém o ecossistema completo de backend da aplicação **Finança AI** reescrito em **C# e ASP.NET Core (.NET 8.0)**, projetado com arquitetura de alta performance utilizando **Minimal APIs**, injeção de dependência e suporte nativo a múltiplos provedores de inteligência artificial.

## 🎯 Visão Geral da Arquitetura

Este backend espelha com precisão a estrutura e o comportamento de controle de dados e agentes de IA implementados na versão original em TypeScript, permitindo que você:

1. **Persista seu estado completo localmente** em um arquivo estruturado `state.json`.
2. **Execute o Assistente de IA de Finanças** integrando:
   - **Google Gemini v1beta** (usando o endpoint otimizado com `systemInstruction`).
   - **OpenAI API** (ChatGPT com modelos como `gpt-4o-mini`).
   - **NVIDIA NIM** (Llama 3.1, Nemotron, Mistral).
   - **Provedores Customizados** compatíveis com o padrão da OpenAI.
3. **Selecione os mesmos 6 Agentes Estratégicos** (Tony Investidor, Silas Poupador, Sofia Professora, Arthur Terapeuta, Nerd dos Números, Dr. Finança).

---

## 🛠️ Requisitos para Rodar Localmente

Certifique-se de possuir instalado em sua máquina:
- **[.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)** ou superior.
- Qualquer IDE moderna como **Visual Studio 2022**, **VS Code** ou **JetBrains Rider**.

---

## 🚀 Como Executar

### 1. Linha de Comando (CLI)

Navegue até a pasta `csharp` e execute os comandos:

```bash
# Restaurar pacotes do NuGet
dotnet restore

# Compilar o projeto
dotnet build

# Executar a API
dotnet run
```

Por padrão, a aplicação irá iniciar e escutar no endereço:
👉 **http://localhost:5000** (ou a porta aleatória indicada pelo console).

### 2. Documentação Swagger Interativa

Com a API rodando, você pode acessar a interface interativa do Swagger para realizar requisições e testar os endpoints:
👉 **http://localhost:5000/swagger**

---

## 📂 Estrutura de Arquivos

* 📄 **`FinancaAI.csproj`**: Definição do projeto contendo as referências ao OpenAPI e Swashbuckle (Swagger).
* 📄 **`Models.cs`**: Definição fortemente tipada com C# 12 Records de todas as classes financeiras (`Account`, `Card`, `Transaction`, `Investment`, `Debtor`, `Creditor`, `Goal`, `AppSettings`).
* 📂 **`Services/`**
  - 📄 **`AiService.cs`**: O motor inteligente que mapeia o contexto financeiro, constrói os prompts de sistema baseados nos agentes selecionados e faz requisições assíncronas assépticas para o Gemini, OpenAI e Nvidia.
* 📄 **`Program.cs`**: Configuração do Pipeline HTTP, CORS, injeção de dependências e mapeamento de rotas (Minimal APIs) para gerenciar o estado e o Chat de IA.

---

## 🧭 Endpoints Disponíveis

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| **GET** | `/` | Retorna o status, versão da API e link para o Swagger. |
| **GET** | `/api/state` | Carrega o estado completo do aplicativo (contas, cartões, metas, etc) do arquivo `state.json`. |
| **POST** | `/api/state` | Grava o estado atualizado no arquivo `state.json`. |
| **GET** | `/api/accounts` | Retorna a lista de contas financeiras registradas. |
| **POST** | `/api/accounts` | Registra/atualiza uma conta e salva o progresso. |
| **GET** | `/api/cards` | Retorna todos os cartões de crédito. |
| **POST** | `/api/cards` | Registra/atualiza um cartão de crédito. |
| **GET** | `/api/transactions` | Retorna o histórico de transações completas. |
| **POST** | `/api/transactions` | Registra uma nova transação. |
| **POST** | `/api/gemini/chat` | **Endpoint Unificado da IA**. Envia histórico, mensagem e contexto financeiro ao modelo configurado. |

---

## 🔗 Conectando o Frontend React ao Backend C#

Para rodar o frontend React se comunicando diretamente com o backend C#, basta abrir o arquivo `/src/components/AiAssistantView.tsx` (ou o arquivo de API correspondente) e ajustar a URL das requisições de `/api/gemini/chat` para `http://localhost:5000/api/gemini/chat`!

Como o CORS já vem habilitado por padrão em todas as origens na API do C#, a comunicação funcionará de forma imediata e transparente.
