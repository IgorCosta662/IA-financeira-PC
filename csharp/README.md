# 🚀 Finança AI Ultimate - Edição de Console C# (.NET 8)

Esta pasta contém o aplicativo completo **Finança AI** reescrito em **C# e .NET 8.0** como um programa de terminal interativo (Console App) de alta performance. 

Diferente do backend web tradicional, este programa é **100% autônomo** e roda inteiramente dentro da sua janela do terminal de comandos, sem depender de navegadores web!

## 🎯 Funcionalidades

Este aplicativo C# espelha com fidelidade todos os recursos do aplicativo original:

1. **Painel Financeiro Completo**: Visualização unificada de saldos, limites e investimentos.
2. **Gerenciamento de Contas**: Adicione e gerencie suas contas bancárias (Corrente, Poupança, Dinheiro em mãos).
3. **Cartões de Crédito**: Acompanhe o limite e o dia do vencimento dos seus cartões.
4. **Registrador de Transações**: Lance receitas e despesas que atualizam o saldo das suas contas automaticamente em tempo real.
5. **Investimentos & Patrimônio**: Acompanhe a valorização de ativos e as taxas estimadas de rendimento anual.
6. **Devedores e Credores**: Registre quem deve dinheiro a você e acompanhe o pagamento de parcelas de suas próprias dívidas.
7. **Metas Financeiras**: Crie metas de economia (como viagens ou compras) e adicione fundos conforme economiza.
8. **💬 Chat Integrado com Inteligência Artificial**: Converse diretamente com o seu Consultor Virtual utilizando:
   - **Google Gemini v1beta** (com a chave do servidor ou sua chave pessoal).
   - **OpenAI (ChatGPT)** (com suporte a modelos como `gpt-4o-mini`).
   - **NVIDIA NIM** (Llama 3.1, Nemotron, Mistral).
   - **Provedores Customizados** (Groq, DeepSeek, etc).
9. **Personalidades dos Agentes de IA**: Alterne entre os mesmos 6 consultores estratégicos:
   - *Tony [Investidor Arrojado]*
   - *Silas [Poupador Conservador]*
   - *Sofia [Professora de Finanças]*
   - *Arthur [Terapeuta Financeiro]*
   - *Nerd dos Números [Pragmático]*
   - *Dr. Finança [Equilibrado / Padrão]*

---

## 💾 Sincronização e Persistência de Dados

O aplicativo lê e grava todas as informações em um arquivo estruturado de formato aberto `state.json`. 

- O arquivo `state.json` é lido do diretório raiz.
- Toda alteração que você faz no aplicativo em C# é sincronizada instantaneamente com o arquivo, garantindo que o seu progresso nunca seja perdido.

---

## 🛠️ Requisitos para Rodar Localmente

Certifique-se de possuir instalado em sua máquina:
- **[.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)** ou superior.

---

## 🚀 Como Executar Muito Rápido

Você pode usar o inicializador automático que criamos na pasta para você:

### Pelo Inicializador Rápido (.bat)
Basta dar um duplo clique no arquivo:
👉 **`iniciar.bat`** (localizado dentro desta pasta `/csharp`)

Isso irá automaticamente restaurar as dependências, compilar o programa em modo otimizado (Release) e abrir a aplicação de console interativa para você!

### Pelo Terminal de Comando (CLI)
Abra o terminal na pasta `csharp` e digite:

```bash
# Restaurar dependências e executar o programa
dotnet run -c Release
```
