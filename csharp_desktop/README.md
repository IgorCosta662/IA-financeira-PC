# 🖥️ Finança AI Ultimate - Edição Desktop (Interface Gráfica C# WPF)

Esta pasta contém o aplicativo completo **Finança AI** reescrito em **C# WPF (Windows Presentation Foundation) e .NET 8.0** com uma interface gráfica nativa de altíssima fidelidade, moderna e elegante!

Diferente do aplicativo de console, esta versão oferece uma **experiência visual completa de desktop nativo**, com barra lateral de navegação, painéis com cards responsivos, listas interativas de transações e uma interface de chat muito mais amigável, sem precisar abrir o navegador!

---

## ✨ Funcionalidades Gráficas

A versão C# Desktop reproduz e aprimora os recursos do ecossistema Finança AI:

1. **📊 Painel de Controle (Dashboard)**:
   - Cards com design premium de cantos arredondados destacando o **Saldo Total**, **Patrimônio Investido** e **Dívidas**.
   - Listas dinâmicas com indicadores visuais coloridos para despesas (vermelho) e receitas (verde).
   - Progresso visual das **Metas de Economia** em tempo real através de barras de progresso nativas.
   - Lista resumida dos cartões de crédito e seus limites.

2. **🏦 Gerenciamento de Contas**:
   - Visualização moderna de todas as contas cadastradas.
   - Formulário lateral integrado para adicionar novas contas com seleção intuitiva de tipo (Corrente, Poupança, Carteira digital, etc.).

3. **💳 Cartões de Crédito**:
   - Acompanhamento gráfico de limites e faturas.
   - Formulário de cadastro de novos cartões com logos representativos de bandeiras.

4. **💸 Registrador de Transações**:
   - Histórico de lançamentos detalhado.
   - Formulário inteligente de lançamentos que abate/soma o valor diretamente do saldo da conta selecionada automaticamente.

5. **📈 Investimentos**:
   - Painel de ativos do seu portfólio.
   - Acompanhamento simplificado com valorização e taxa estimada de rendimento anual.

6. **💬 Chat de IA Avançado (Consultor Virtual)**:
   - Interface de conversação em formato de bolhas de chat (estilo WhatsApp/ChatGPT) super interativa.
   - Seletor rápido de personalidade para alternar entre os **6 Consultores Financeiros**:
     - *Dr. Finança [Equilibrado]*
     - *Tony [Investidor Arrojado]*
     - *Sr. Silas [Poupador Conservador]*
     - *Sofia [Educadora]*
     - *Arthur [Terapeuta Financeiro]*
     - *Nerd dos Números [Pragmático]*
   - Suporte a múltiplos provedores de inteligência artificial (Gemini, OpenAI, NVIDIA NIM ou personalizados).

7. **⚙️ Configurações**:
   - Edição de perfil do usuário.
   - Customização de moeda padrão (BRL, USD, EUR).
   - Gerenciamento completo de chaves de API com inputs contextuais inteligentes que ocultam/mostram campos de acordo com o provedor selecionado.

---

## 💾 Sincronização Automática com o Console e Web

O aplicativo C# Desktop utiliza o mesmo arquivo de persistência aberta **`state.json`** no diretório. 
- Qualquer transação lançada na versão gráfica é refletida instantaneamente no arquivo de dados compartilhados.
- Você pode alternar entre o aplicativo de console C# e a versão gráfica desktop que seus dados se manterão 100% sincronizados!

---

## 🚀 Como Executar Muito Rápido

### Pelo Inicializador Rápido (.bat)
Basta dar um duplo clique no arquivo:
👉 **`iniciar.bat`** (localizado dentro desta pasta `/csharp_desktop`)

Isso irá automaticamente restaurar as dependências, compilar o programa de desktop em modo otimizado (Release) e abrir a interface gráfica do usuário nativa para você!

### Pelo Terminal de Comando (CLI)
Abra o terminal na pasta `csharp_desktop` e digite:

```bash
# Executar a aplicação nativa de interface gráfica
dotnet run -c Release
```

---

## 🛠️ Requisitos de Execução
- **Sistema Operacional**: Windows (com suporte a WPF nativo).
- **Runtime**: **[.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)** ou superior instalado.
