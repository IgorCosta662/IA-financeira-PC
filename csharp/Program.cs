using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using FinancaAI.Models;
using FinancaAI.Services;

namespace FinancaAI
{
    class Program
    {
        private const string StateFilePath = "state.json";
        private static FinancialState _state = null!;
        private static AiService _aiService = null!;
        private static readonly HttpClient _httpClient = new HttpClient();

        static async Task Main(string[] args)
        {
            // Set console to UTF-8 to display characters and currencies (R$) correctly
            Console.OutputEncoding = Encoding.UTF8;
            Console.InputEncoding = Encoding.UTF8;

            _aiService = new AiService(_httpClient);
            LoadOrCreateState();

            bool running = true;
            while (running)
            {
                Console.Clear();
                DrawHeader();
                DrawMiniDashboard();
                DrawMainMenu();

                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.Write(" Selecione uma opção (0-9): ");
                Console.ResetColor();

                string? choice = Console.ReadLine()?.Trim();
                switch (choice)
                {
                    case "1":
                        ShowDashboardDetails();
                        break;
                    case "2":
                        GerenciarContas();
                        break;
                    case "3":
                        GerenciarCartoes();
                        break;
                    case "4":
                        RegistrarTransacao();
                        break;
                    case "5":
                        GerenciarInvestimentos();
                        break;
                    case "6":
                        GerenciarDevedoresCredores();
                        break;
                    case "7":
                        GerenciarMetas();
                        break;
                    case "8":
                        await ConversarComIA();
                        break;
                    case "9":
                        MenuConfiguracoes();
                        break;
                    case "0":
                        running = false;
                        Console.Clear();
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("\n Obrigado por usar o Finança AI Ultimate! Até mais!\n");
                        Console.ResetColor();
                        break;
                    default:
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("\n Opção inválida! Pressione qualquer tecla para continuar...");
                        Console.ResetColor();
                        Console.ReadKey();
                        break;
                }
            }
        }

        #region State Management

        private static void LoadOrCreateState()
        {
            // Check if state.json exists in root or local folder
            string path = StateFilePath;
            if (!File.Exists(path) && File.Exists("../state.json"))
            {
                path = "../state.json";
            }

            if (File.Exists(path))
            {
                try
                {
                    string json = File.ReadAllText(path);
                    _state = JsonSerializer.Deserialize<FinancialState>(json) ?? CreateDefaultState();
                    return;
                }
                catch
                {
                    // Fallback to default if corrupt
                }
            }

            _state = CreateDefaultState();
            SaveState();
        }

        private static FinancialState CreateDefaultState()
        {
            return new FinancialState(
                Accounts: new List<Account>
                {
                    new Account("acc-1", "Carteira Principal", "checking", 1500.00m, "#3b82f6"),
                    new Account("acc-2", "Reserva de Emergência", "savings", 5000.00m, "#10b981")
                },
                Cards: new List<Card>
                {
                    new Card("card-1", "NuBank", "Roxinho", "mastercard", 3000.00m, 5, 10, "#8b5cf6")
                },
                Transactions: new List<Transaction>
                {
                    new Transaction("t-1", "Salário Mensal", 3500.00m, "income", DateTime.Now.ToString("yyyy-MM-dd"), "Salário", "acc-1"),
                    new Transaction("t-2", "Supermercado Copa", 250.00m, "expense", DateTime.Now.ToString("yyyy-MM-dd"), "Alimentação", "acc-1")
                },
                Investments: new List<Investment>
                {
                    new Investment("inv-1", "Tesouro Selic 2029", "Renda Fixa", 2000.00m, 2120.50m, 10.75m, 0, DateTime.Now.AddMonths(-6).ToString("yyyy-MM-dd"))
                },
                Debtors: new List<Debtor>
                {
                    new Debtor("deb-1", "Amigo Carlos", 150.00m, DateTime.Now.ToString("yyyy-MM-dd"), "Empréstimo almoço", "pending")
                },
                Creditors: new List<Creditor>
                {
                    new Creditor("cred-1", "Banco de Financiamento", 12000.00m, DateTime.Now.ToString("yyyy-MM-dd"), 24, 6, 1.5m, "pending")
                },
                Goals: new List<Goal>
                {
                    new Goal("goal-1", "Viagem de Fim de Ano", 5000.00m, 1200.00m, DateTime.Now.AddMonths(6).ToString("yyyy-MM-dd"), "Lazer")
                },
                Settings: new AppSettings("Usuário C#", "BRL", false, "blue", "", "gemini-2.5-flash", "default", "gemini"),
                Security: new SecuritySettings(false, "", false)
            );
        }

        private static void SaveState()
        {
            try
            {
                string json = JsonSerializer.Serialize(_state, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(StateFilePath, json);
                // Also save to parent if exists to sync with Web App
                if (Directory.Exists("../src"))
                {
                    File.WriteAllText("../state.json", json);
                }
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"Erro ao salvar progresso: {ex.Message}");
                Console.ResetColor();
                Console.ReadKey();
            }
        }

        #endregion

        #region Beautiful UI Helpers

        private static void DrawHeader()
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(@"  ███████╗██╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗ █████╗     █████╗ ██╗");
            Console.WriteLine(@"  ██╔════╝██║████╗  ██║██╔══██╗████╗  ██║██╔════╝██╔══██╗   ██╔══██╗██║");
            Console.WriteLine(@"  █████╗  ██║██╔██╗ ██║███████║██╔██╗ ██║██║     ███████║   ███████║██║");
            Console.WriteLine(@"  ██╔══╝  ██║██║╚██╗██║██╔══██║██║╚██╗██║██║     ██╔══██║   ██╔══██║██║");
            Console.WriteLine(@"  ██║     ██║██║ ╚████║██║  ██║██║ ╚████║╚██████╗██║  ██║██╗██║  ██║██║");
            Console.WriteLine(@"  ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝");
            Console.WriteLine("  =====================================================================");
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine($"  Versão Executável Standalone C# .NET 8 | Olá, {_state.Settings.UserName ?? "Usuário"}!");
            Console.WriteLine("  =====================================================================");
            Console.ResetColor();
        }

        private static void DrawMiniDashboard()
        {
            decimal totalAccounts = 0;
            foreach (var acc in _state.Accounts) totalAccounts += acc.Balance;

            decimal totalInvestments = 0;
            foreach (var inv in _state.Investments) totalInvestments += inv.CurrentAmount;

            decimal totalDebtors = 0;
            foreach (var deb in _state.Debtors) if (deb.Status == "pending") totalDebtors += deb.Amount;

            decimal totalCreditors = 0;
            foreach (var cred in _state.Creditors) if (cred.Status == "pending") totalCreditors += cred.Amount;

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            Console.WriteLine();
            Console.Write("  💵 Saldo das Contas: ");
            Console.ForegroundColor = ConsoleColor.Green;
            Console.Write($"{currency} {totalAccounts:N2}");
            Console.ResetColor();

            Console.Write("  |  📈 Patrimônio Investido: ");
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.Write($"{currency} {totalInvestments:N2}");
            Console.ResetColor();
            Console.WriteLine();

            Console.Write("  🤝 A Receber: ");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write($"{currency} {totalDebtors:N2}");
            Console.ResetColor();

            Console.Write("        |  🚨 Total de Dívidas: ");
            Console.ForegroundColor = ConsoleColor.Red;
            Console.Write($"{currency} {totalCreditors:N2}");
            Console.ResetColor();
            Console.WriteLine();
            Console.WriteLine("  ---------------------------------------------------------------------");
        }

        private static void DrawMainMenu()
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("  [1] 📊 Painel Completo e Estatísticas");
            Console.WriteLine("  [2] 🏦 Gerenciar Contas Bancárias");
            Console.WriteLine("  [3] 💳 Gerenciar Cartões de Crédito");
            Console.WriteLine("  [4] 💸 Registrar Nova Transação");
            Console.WriteLine("  [5] 📈 Investimentos & Rendimentos");
            Console.WriteLine("  [6] 🤝 Devedores e Credores (Dívidas)");
            Console.WriteLine("  [7] 🎯 Metas de Economia");
            Console.WriteLine("  [8] 💬 Conversar com o Assistente de IA");
            Console.WriteLine("  [9] ⚙️ Configurações (Trocar Provedor de IA/Tema/Chaves)");
            Console.WriteLine("  [0] ❌ Sair da Aplicação");
            Console.WriteLine("  ---------------------------------------------------------------------");
            Console.ResetColor();
        }

        private static void WaitKey()
        {
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("\n Pressione qualquer tecla para voltar ao menu principal...");
            Console.ResetColor();
            Console.ReadKey();
        }

        private static string GetTypeIcon(string type)
        {
            return type switch
            {
                "checking" => "💳 Corrente",
                "savings" => "🐖 Poupança / Reserva",
                "digital_wallet" => "📱 Carteira Digital",
                "cash" => "💵 Dinheiro em Mãos",
                _ => type
            };
        }

        #endregion

        #region Views Implementation

        private static void ShowDashboardDetails()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine(" === 📊 PAINEL FINANCEIRO COMPLETO ===");
            Console.ResetColor();

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            Console.WriteLine("\n -> CONTAS:");
            foreach (var acc in _state.Accounts)
            {
                Console.WriteLine($"   * {acc.Name} ({GetTypeIcon(acc.Type)}): {currency} {acc.Balance:N2}");
            }

            Console.WriteLine("\n -> CARTÕES DE CRÉDITO:");
            if (_state.Cards.Count == 0) Console.WriteLine("   Nenhum cartão cadastrado.");
            foreach (var card in _state.Cards)
            {
                Console.WriteLine($"   * {card.Bank} {card.CardName} ({card.Brand.ToUpper()}): Limite {currency} {card.Limit:N2} - Vence Dia {card.DueDay}");
            }

            Console.WriteLine("\n -> ÚLTIMAS TRANSAÇÕES (MÁX 10):");
            if (_state.Transactions.Count == 0) Console.WriteLine("   Nenhuma transação cadastrada.");
            int count = 0;
            for (int i = _state.Transactions.Count - 1; i >= 0 && count < 10; i--)
            {
                var t = _state.Transactions[i];
                Console.Write($"   [{t.Date}] {t.Description,-22} | {t.Category,-12} | ");
                if (t.Type == "income" || t.Type == "refund")
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"+ {currency} {t.Amount:N2}");
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"- {currency} {t.Amount:N2}");
                }
                Console.ResetColor();
                count++;
            }

            Console.WriteLine("\n -> PROGRESSO DAS METAS:");
            if (_state.Goals.Count == 0) Console.WriteLine("   Nenhuma meta cadastrada.");
            foreach (var g in _state.Goals)
            {
                decimal pct = g.TargetAmount > 0 ? (g.CurrentAmount / g.TargetAmount) * 100 : 0;
                Console.WriteLine($"   * {g.Name}: {currency} {g.CurrentAmount:N2} de {g.TargetAmount:N2} ({pct:F1}% Concluído) - Prazo: {g.Deadline}");
            }

            WaitKey();
        }

        private static void GerenciarContas()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine(" === 🏦 GERENCIAR CONTAS BANCÁRIAS ===");
            Console.ResetColor();

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            Console.WriteLine("\n Contas Existentes:");
            for (int i = 0; i < _state.Accounts.Count; i++)
            {
                var acc = _state.Accounts[i];
                Console.WriteLine($"  [{i + 1}] {acc.Name} ({GetTypeIcon(acc.Type)}) - Saldo: {currency} {acc.Balance:N2}");
            }

            Console.WriteLine("\n [A] Adicionar Nova Conta");
            Console.WriteLine(" [V] Voltar ao Menu");
            Console.Write("\n Opção: ");
            string? opt = Console.ReadLine()?.Trim().ToUpper();

            if (opt == "A")
            {
                Console.Write(" Nome da Conta (ex: Banco do Brasil): ");
                string name = Console.ReadLine() ?? "Conta";
                
                Console.WriteLine(" Tipo de Conta:");
                Console.WriteLine("  1 - Conta Corrente (checking)");
                Console.WriteLine("  2 - Conta Poupança / Reserva (savings)");
                Console.WriteLine("  3 - Carteira Digital (digital_wallet)");
                Console.WriteLine("  4 - Dinheiro em Mãos (cash)");
                Console.Write(" Seleção: ");
                string tChoice = Console.ReadLine() ?? "1";
                string type = tChoice switch
                {
                    "2" => "savings",
                    "3" => "digital_wallet",
                    "4" => "cash",
                    _ => "checking"
                };

                Console.Write(" Saldo Inicial: ");
                decimal.TryParse(Console.ReadLine(), out decimal bal);

                var newAcc = new Account($"acc-{Guid.NewGuid().ToString().Substring(0, 6)}", name, type, bal, "#3b82f6");
                _state.Accounts.Add(newAcc);
                SaveState();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n Conta criada com sucesso!");
                Console.ResetColor();
                Console.ReadKey();
            }
        }

        private static void GerenciarCartoes()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine(" === 💳 GERENCIAR CARTÕES DE CRÉDITO ===");
            Console.ResetColor();

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            Console.WriteLine("\n Cartões Cadastrados:");
            if (_state.Cards.Count == 0) Console.WriteLine("  Nenhum cartão registrado.");
            for (int i = 0; i < _state.Cards.Count; i++)
            {
                var card = _state.Cards[i];
                Console.WriteLine($"  [{i + 1}] {card.Bank} ({card.CardName}) - Limite: {currency} {card.Limit:N2} (Dia de Vencimento: {card.DueDay})");
            }

            Console.WriteLine("\n [A] Adicionar Novo Cartão");
            Console.WriteLine(" [V] Voltar ao Menu");
            Console.Write("\n Opção: ");
            string? opt = Console.ReadLine()?.Trim().ToUpper();

            if (opt == "A")
            {
                Console.Write(" Nome do Banco (ex: Nubank, Itaú): ");
                string bank = Console.ReadLine() ?? "Banco";

                Console.Write(" Apelido do Cartão (ex: Cartão de Milhas): ");
                string cName = Console.ReadLine() ?? "Cartão";

                Console.Write(" Bandeira (visa, mastercard, elo, amex): ");
                string brand = Console.ReadLine()?.ToLower() ?? "visa";

                Console.Write(" Limite Total: ");
                decimal.TryParse(Console.ReadLine(), out decimal lim);

                Console.Write(" Dia de Vencimento da Fatura (1-31): ");
                int.TryParse(Console.ReadLine(), out int dueDay);

                var newCard = new Card($"card-{Guid.NewGuid().ToString().Substring(0, 6)}", bank, cName, brand, lim, dueDay - 5 > 0 ? dueDay - 5 : 28, dueDay, "#6366f1");
                _state.Cards.Add(newCard);
                SaveState();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n Cartão cadastrado com sucesso!");
                Console.ResetColor();
                Console.ReadKey();
            }
        }

        private static void RegistrarTransacao()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine(" === 💸 REGISTRAR NOVA TRANSAÇÃO ===");
            Console.ResetColor();

            if (_state.Accounts.Count == 0)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\n É necessário cadastrar pelo menos uma conta antes de registrar transações!");
                Console.ResetColor();
                Console.ReadKey();
                return;
            }

            Console.WriteLine("\n Selecione o Tipo:");
            Console.WriteLine("  1 - Despesa (Expense)");
            Console.WriteLine("  2 - Receita / Entrada (Income)");
            Console.Write(" Opção: ");
            string type = Console.ReadLine() == "2" ? "income" : "expense";

            Console.Write(" Descrição (ex: Almoço Executivo): ");
            string desc = Console.ReadLine() ?? "Transação";

            Console.Write(" Valor: ");
            decimal.TryParse(Console.ReadLine(), out decimal amount);

            Console.Write(" Categoria (ex: Alimentação, Transporte, Salário): ");
            string cat = Console.ReadLine() ?? "Geral";

            Console.WriteLine("\n Vincular à qual conta?");
            for (int i = 0; i < _state.Accounts.Count; i++)
            {
                Console.WriteLine($"  [{i + 1}] {_state.Accounts[i].Name}");
            }
            Console.Write(" Seleção: ");
            int.TryParse(Console.ReadLine(), out int accIdx);
            accIdx = Math.Max(1, Math.Min(accIdx, _state.Accounts.Count)) - 1;
            var targetAcc = _state.Accounts[accIdx];

            // Adjust Account Balance
            decimal balanceAdjust = type == "income" ? amount : -amount;
            var updatedAcc = targetAcc with { Balance = targetAcc.Balance + balanceAdjust };
            _state.Accounts[accIdx] = updatedAcc;

            var newT = new Transaction(
                $"t-{Guid.NewGuid().ToString().Substring(0, 6)}",
                desc,
                amount,
                type,
                DateTime.Now.ToString("yyyy-MM-dd"),
                cat,
                targetAcc.Id
            );

            _state.Transactions.Add(newT);
            SaveState();

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n Transação registrada e saldo atualizado com sucesso!");
            Console.ResetColor();
            Console.ReadKey();
        }

        private static void GerenciarInvestimentos()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine(" === 📈 INVESTIMENTOS E PATRIMÔNIO ===");
            Console.ResetColor();

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            Console.WriteLine("\n Investimentos Ativos:");
            if (_state.Investments.Count == 0) Console.WriteLine("  Nenhum investimento registrado.");
            for (int i = 0; i < _state.Investments.Count; i++)
            {
                var inv = _state.Investments[i];
                decimal rend = inv.CurrentAmount - inv.InvestedAmount;
                Console.Write($"  [{i + 1}] {inv.Name} ({inv.Type}) - Investido: {currency} {inv.InvestedAmount:N2} | Atual: {currency} {inv.CurrentAmount:N2} (");
                if (rend >= 0)
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.Write($"+{currency} {rend:N2}");
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.Write($"-{currency} {Math.Abs(rend):N2}");
                }
                Console.ResetColor();
                Console.WriteLine($", Rend. Anual: {inv.YieldRate}%)");
            }

            Console.WriteLine("\n [A] Adicionar Novo Investimento");
            Console.WriteLine(" [V] Voltar ao Menu");
            Console.Write("\n Opção: ");
            string? opt = Console.ReadLine()?.Trim().ToUpper();

            if (opt == "A")
            {
                Console.Write(" Nome do Ativo (ex: CDB 110% CDI, VALE3): ");
                string name = Console.ReadLine() ?? "Ativo";

                Console.Write(" Tipo (Renda Fixa, Ações, FIIs, Cripto): ");
                string type = Console.ReadLine() ?? "Renda Fixa";

                Console.Write(" Valor Investido: ");
                decimal.TryParse(Console.ReadLine(), out decimal invested);

                Console.Write(" Valor Atualizado: ");
                decimal.TryParse(Console.ReadLine(), out decimal current);

                Console.Write(" Taxa de Rendimento Estimada (% ao ano): ");
                decimal.TryParse(Console.ReadLine(), out decimal yieldRate);

                var newInv = new Investment(
                    $"inv-{Guid.NewGuid().ToString().Substring(0, 6)}",
                    name,
                    type,
                    invested,
                    current,
                    yieldRate,
                    0,
                    DateTime.Now.ToString("yyyy-MM-dd")
                );

                _state.Investments.Add(newInv);
                SaveState();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n Investimento registrado com sucesso!");
                Console.ResetColor();
                Console.ReadKey();
            }
        }

        private static void GerenciarDevedoresCredores()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine(" === 🤝 DEVEDORES E CREDORES (DÍVIDAS) ===");
            Console.ResetColor();

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            Console.WriteLine("\n 💰 Quem te Deve (Dinheiro a receber de terceiros):");
            if (_state.Debtors.Count == 0) Console.WriteLine("  Nenhum registro.");
            foreach (var d in _state.Debtors)
            {
                Console.WriteLine($"   * {d.Name}: {currency} {d.Amount:N2} - {d.Observation} (Status: {d.Status.ToUpper()})");
            }

            Console.WriteLine("\n 🚨 Credores (Quem você deve - Parcelas/Contratos):");
            if (_state.Creditors.Count == 0) Console.WriteLine("  Nenhum registro.");
            foreach (var c in _state.Creditors)
            {
                Console.WriteLine($"   * {c.CreditorName}: Total {currency} {c.Amount:N2} (Parcela {c.CurrentInstallment}/{c.InstallmentsCount}) - Status: {c.Status.ToUpper()}");
            }

            Console.WriteLine("\n [1] Registrar Empréstimo feito a alguém (Novo Devedor)");
            Console.WriteLine(" [2] Registrar Dívida própria (Novo Credor)");
            Console.WriteLine(" [V] Voltar ao Menu");
            Console.Write("\n Opção: ");
            string? choice = Console.ReadLine()?.Trim();

            if (choice == "1")
            {
                Console.Write(" Nome da Pessoa que te deve: ");
                string name = Console.ReadLine() ?? "Pessoa";
                Console.Write(" Valor do Empréstimo: ");
                decimal.TryParse(Console.ReadLine(), out decimal amt);
                Console.Write(" Observação: ");
                string obs = Console.ReadLine() ?? "";

                _state.Debtors.Add(new Debtor($"deb-{Guid.NewGuid().ToString().Substring(0, 6)}", name, amt, DateTime.Now.ToString("yyyy-MM-dd"), obs, "pending"));
                SaveState();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n Registro efetuado!");
                Console.ResetColor();
                Console.ReadKey();
            }
            else if (choice == "2")
            {
                Console.Write(" Nome do Credor (Banco, Amigo): ");
                string name = Console.ReadLine() ?? "Credor";
                Console.Write(" Valor total da dívida: ");
                decimal.TryParse(Console.ReadLine(), out decimal amt);
                Console.Write(" Quantidade total de parcelas: ");
                int.TryParse(Console.ReadLine(), out int par);

                _state.Creditors.Add(new Creditor($"cred-{Guid.NewGuid().ToString().Substring(0, 6)}", name, amt, DateTime.Now.ToString("yyyy-MM-dd"), par, 1, 0, "pending"));
                SaveState();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n Dívida registrada com sucesso!");
                Console.ResetColor();
                Console.ReadKey();
            }
        }

        private static void GerenciarMetas()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine(" === 🎯 METAS FINANCEIRAS DE ECONOMIA ===");
            Console.ResetColor();

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            Console.WriteLine("\n Metas:");
            if (_state.Goals.Count == 0) Console.WriteLine("  Nenhuma meta criada.");
            for (int i = 0; i < _state.Goals.Count; i++)
            {
                var g = _state.Goals[i];
                decimal pct = g.TargetAmount > 0 ? (g.CurrentAmount / g.TargetAmount) * 100 : 0;
                Console.WriteLine($"  [{i + 1}] {g.Name} ({g.Category}) - Guardado: {currency} {g.CurrentAmount:N2} de {g.TargetAmount:N2} ({pct:F1}% Concluído)");
            }

            Console.WriteLine("\n [A] Criar Nova Meta");
            Console.WriteLine(" [P] Poupar para uma Meta");
            Console.WriteLine(" [V] Voltar ao Menu");
            Console.Write("\n Opção: ");
            string? opt = Console.ReadLine()?.Trim().ToUpper();

            if (opt == "A")
            {
                Console.Write(" Nome da Meta (ex: Comprar Notebook): ");
                string name = Console.ReadLine() ?? "Meta";
                Console.Write(" Valor Alvo: ");
                decimal.TryParse(Console.ReadLine(), out decimal target);
                Console.Write(" Categoria (Lazer, Reserva, Estudos): ");
                string cat = Console.ReadLine() ?? "Reserva";
                Console.Write(" Prazo (AAAA-MM-DD): ");
                string deadline = Console.ReadLine() ?? DateTime.Now.AddYears(1).ToString("yyyy-MM-dd");

                _state.Goals.Add(new Goal($"goal-{Guid.NewGuid().ToString().Substring(0, 6)}", name, target, 0, deadline, cat));
                SaveState();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n Meta criada!");
                Console.ResetColor();
                Console.ReadKey();
            }
            else if (opt == "P" && _state.Goals.Count > 0)
            {
                Console.Write(" Selecione o número da meta: ");
                int.TryParse(Console.ReadLine(), out int idx);
                idx = Math.Max(1, Math.Min(idx, _state.Goals.Count)) - 1;

                Console.Write(" Quanto deseja poupar hoje? ");
                decimal.TryParse(Console.ReadLine(), out decimal saveAmt);

                var g = _state.Goals[idx];
                _state.Goals[idx] = g with { CurrentAmount = g.CurrentAmount + saveAmt };
                SaveState();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n Valor poupado com sucesso!");
                Console.ResetColor();
                Console.ReadKey();
            }
        }

        #endregion

        #region Interactive AI Advisor Chat

        private static async Task ConversarComIA()
        {
            Console.Clear();
            DrawHeader();
            Console.ForegroundColor = ConsoleColor.DarkYellow;
            Console.WriteLine(" === 💬 CHAT INTELIGENTE COM CONSULTOR FINANCEIRO ===");
            Console.ResetColor();

            string provider = _state.Settings.SelectedProvider ?? "gemini";
            string model = _state.Settings.SelectedModel ?? "gemini-2.5-flash";
            string agent = _state.Settings.SelectedAgent ?? "default";

            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine($" Conexão Ativa: {provider.ToUpper()} ({model})");
            Console.WriteLine($" Personalidade do Agente: {agent.ToUpper()}");
            Console.WriteLine(" Digite 'SAIR' para retornar ao menu.");
            Console.WriteLine(" =====================================================================");
            Console.ResetColor();

            // Mapeamento visual das saídas do assistente
            string agentName = agent switch
            {
                "investor" => "💼 Tony [Investidor]",
                "poupador" => "🐖 Silas [Poupador]",
                "educador" => "👩‍🏫 Sofia [Professora]",
                "psicologo" => "🧘 Arthur [Psicólogo]",
                "nerd" => "🤓 Nerd dos Números",
                _ => "🤖 Dr. Finança"
            };

            List<AiChatMessage> history = new List<AiChatMessage>();

            while (true)
            {
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.Write("\n Você: ");
                Console.ResetColor();
                string? input = Console.ReadLine()?.Trim();

                if (string.IsNullOrWhiteSpace(input)) continue;
                if (input.Equals("SAIR", StringComparison.OrdinalIgnoreCase)) break;

                Console.ForegroundColor = ConsoleColor.DarkYellow;
                Console.WriteLine($"\n {agentName} está pensando...");
                Console.ResetColor();

                var req = new AiChatRequest(
                    Message: input,
                    History: history,
                    FinancialData: _state,
                    CustomGeminiKey: _state.Settings.CustomGeminiKey,
                    SelectedModel: model,
                    SelectedAgent: agent,
                    SelectedProvider: provider,
                    CustomOpenAiKey: _state.Settings.CustomOpenAiKey,
                    CustomNvidiaKey: _state.Settings.CustomNvidiaKey,
                    CustomOpenAiBase: _state.Settings.CustomOpenAiBase,
                    CustomOpenAiModel: _state.Settings.CustomOpenAiModel
                );

                // Read server key if present in local system
                string? envKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");

                var result = await _aiService.ProcessChatRequestAsync(req, envKey);

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"\n {agentName}:");
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(result.Text);
                Console.ResetColor();

                history.Add(new AiChatMessage("user", input));
                history.Add(new AiChatMessage("assistant", result.Text));
            }
        }

        #endregion

        #region App Configurations Menu

        private static void MenuConfiguracoes()
        {
            bool inConfig = true;
            while (inConfig)
            {
                Console.Clear();
                DrawHeader();
                Console.ForegroundColor = ConsoleColor.DarkGreen;
                Console.WriteLine(" === ⚙️ CONFIGURAÇÕES E CREDENCIAIS DE IA ===");
                Console.ResetColor();

                Console.WriteLine($"\n  1 - Nome do Usuário: {_state.Settings.UserName}");
                Console.WriteLine($"  2 - Moeda Selecionada: {_state.Settings.Currency}");
                Console.WriteLine($"  3 - Provedor de IA Atual: {(_state.Settings.SelectedProvider ?? "gemini").ToUpper()}");
                Console.WriteLine($"  4 - Modelo de IA Ativo: {_state.Settings.SelectedModel ?? "gemini-2.5-flash"}");
                Console.WriteLine($"  5 - Agente de Finanças (Personalidade): {(_state.Settings.SelectedAgent ?? "default").ToUpper()}");
                Console.WriteLine($"  6 - Chave do Gemini: {ObscureKey(_state.Settings.CustomGeminiKey)}");
                Console.WriteLine($"  7 - Chave do OpenAI (ChatGPT): {ObscureKey(_state.Settings.CustomOpenAiKey)}");
                Console.WriteLine($"  8 - Chave do Nvidia NIM: {ObscureKey(_state.Settings.CustomNvidiaKey)}");
                Console.WriteLine("  9 - Configurações de API Customizada (Groq, DeepSeek, etc.)");
                Console.WriteLine("  0 - Voltar ao Menu Principal");
                Console.WriteLine("  ---------------------------------------------------------------------");

                Console.Write(" Escolha a opção para alterar (0-9): ");
                string? choice = Console.ReadLine()?.Trim();

                switch (choice)
                {
                    case "1":
                        Console.Write(" Novo Nome do Usuário: ");
                        string name = Console.ReadLine() ?? "Usuário";
                        _state = _state with { Settings = _state.Settings with { UserName = name } };
                        SaveState();
                        break;
                    case "2":
                        Console.Write(" Nova Moeda (BRL, USD, EUR): ");
                        string currency = Console.ReadLine()?.ToUpper() ?? "BRL";
                        _state = _state with { Settings = _state.Settings with { Currency = currency } };
                        SaveState();
                        break;
                    case "3":
                        Console.WriteLine("\n Selecione o Provedor:");
                        Console.WriteLine("  1 - Google Gemini");
                        Console.WriteLine("  2 - OpenAI (ChatGPT)");
                        Console.WriteLine("  3 - Nvidia NIM");
                        Console.WriteLine("  4 - Provedor Customizado compatível com OpenAI");
                        Console.Write(" Opção: ");
                        string provOpt = Console.ReadLine() ?? "1";
                        string provider = provOpt switch
                        {
                            "2" => "openai",
                            "3" => "nvidia",
                            "4" => "custom_openai",
                            _ => "gemini"
                        };
                        string defaultModel = provider switch
                        {
                            "openai" => "gpt-4o-mini",
                            "nvidia" => "meta/llama-3.1-70b-instruct",
                            "custom_openai" => "custom-model",
                            _ => "gemini-2.5-flash"
                        };
                        _state = _state with { Settings = _state.Settings with { SelectedProvider = provider, SelectedModel = defaultModel } };
                        SaveState();
                        break;
                    case "4":
                        Console.Write(" Digite o nome do modelo (ex: gemini-2.5-pro, gpt-4o, meta/llama-3.1-70b-instruct): ");
                        string model = Console.ReadLine() ?? "gemini-2.5-flash";
                        _state = _state with { Settings = _state.Settings with { SelectedModel = model } };
                        SaveState();
                        break;
                    case "5":
                        Console.WriteLine("\n Selecione a Personalidade do Agente de IA:");
                        Console.WriteLine("  1 - Dr. Finança [Equilibrado / Padrão] (default)");
                        Console.WriteLine("  2 - Tony [Investidor Arrojado] (investor)");
                        Console.WriteLine("  3 - Sr. Silas [Poupador Conservador] (poupador)");
                        Console.WriteLine("  4 - Sofia [Professora de Finanças Didática] (educador)");
                        Console.WriteLine("  5 - Dr. Arthur [Psicólogo e Terapeuta Financeiro] (psicologo)");
                        Console.WriteLine("  6 - Nerd dos Números [Pragmático e Quantitativo] (nerd)");
                        Console.Write(" Opção: ");
                        string agentOpt = Console.ReadLine() ?? "1";
                        string agent = agentOpt switch
                        {
                            "2" => "investor",
                            "3" => "poupador",
                            "4" => "educador",
                            "5" => "psicologo",
                            "6" => "nerd",
                            _ => "default"
                        };
                        _state = _state with { Settings = _state.Settings with { SelectedAgent = agent } };
                        SaveState();
                        break;
                    case "6":
                        Console.Write(" Insira sua API Key do Gemini (vazia para usar a do servidor): ");
                        string geminiKey = Console.ReadLine() ?? "";
                        _state = _state with { Settings = _state.Settings with { CustomGeminiKey = geminiKey } };
                        SaveState();
                        break;
                    case "7":
                        Console.Write(" Insira sua API Key da OpenAI (ex: sk-...): ");
                        string openaiKey = Console.ReadLine() ?? "";
                        _state = _state with { Settings = _state.Settings with { CustomOpenAiKey = openaiKey } };
                        SaveState();
                        break;
                    case "8":
                        Console.Write(" Insira sua API Key do Nvidia NIM (ex: nvapi-...): ");
                        string nvidiaKey = Console.ReadLine() ?? "";
                        _state = _state with { Settings = _state.Settings with { CustomNvidiaKey = nvidiaKey } };
                        SaveState();
                        break;
                    case "9":
                        Console.Write(" Insira a Base URL personalizada (ex: https://api.groq.com/openai/v1): ");
                        string baseurl = Console.ReadLine() ?? "";
                        Console.Write(" Insira o nome do modelo correspondente (ex: llama3-70b-8192): ");
                        string customModelName = Console.ReadLine() ?? "";
                        _state = _state with { Settings = _state.Settings with { CustomOpenAiBase = baseurl, CustomOpenAiModel = customModelName, SelectedModel = customModelName } };
                        SaveState();
                        break;
                    case "0":
                        inConfig = false;
                        break;
                }
            }
        }

        private static string ObscureKey(string? key)
        {
            if (string.IsNullOrWhiteSpace(key)) return "[Não Definida]";
            if (key.Length <= 8) return "********";
            return key.Substring(0, 4) + "..." + key.Substring(key.Length - 4);
        }

        #endregion
    }
}
