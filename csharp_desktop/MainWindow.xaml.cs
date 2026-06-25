using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Input;
using System.Windows.Media;
using FinancaAIDesktop.Models;
using FinancaAIDesktop.Services;

namespace FinancaAIDesktop
{
    public partial class MainWindow : Window
    {
        private const string StateFilePath = "state.json";
        private FinancialState _state = null!;
        private readonly HttpClient _httpClient = new HttpClient();
        private AiService _aiService = null!;
        
        // Chat History bindings
        private readonly ObservableCollection<ChatBubbleViewModel> _chatBubbles = new();
        private readonly List<AiChatMessage> _aiHistory = new();

        public MainWindow()
        {
            InitializeComponent();
            _aiService = new AiService(_httpClient);
            LoadOrCreateState();
            InitializeUiBindings();
        }

        #region State Management

        private void LoadOrCreateState()
        {
            string path = StateFilePath;
            // Check current or parent folder
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
                    // Fallback to default
                }
            }

            _state = CreateDefaultState();
            SaveState();
        }

        private FinancialState CreateDefaultState()
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

        private void SaveState()
        {
            try
            {
                string json = JsonSerializer.Serialize(_state, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(StateFilePath, json);
                
                // Keep synced with console and main web database
                if (Directory.Exists("../src"))
                {
                    File.WriteAllText("../state.json", json);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao salvar progresso: {ex.Message}", "Erro de Sincronização", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        #endregion

        #region UI Bindings and List Sync

        private void InitializeUiBindings()
        {
            // Sync lists
            RefreshAllLists();

            // Set current config inputs
            TxtSettingsUser.Text = _state.Settings.UserName ?? "Usuário C#";
            TxtFooterUserName.Text = _state.Settings.UserName ?? "Usuário C#";
            
            // Set active currency combo
            foreach (ComboBoxItem item in CboSettingsCurrency.Items)
            {
                if (item.Tag.ToString() == _state.Settings.Currency)
                {
                    item.IsSelected = true;
                    break;
                }
            }

            // Set active provider combo
            foreach (ComboBoxItem item in CboSettingsProvider.Items)
            {
                if (item.Tag.ToString() == (_state.Settings.SelectedProvider ?? "gemini"))
                {
                    item.IsSelected = true;
                    break;
                }
            }

            TxtSettingsModel.Text = _state.Settings.SelectedModel ?? "gemini-2.5-flash";
            TxtSettingsGeminiKey.Text = _state.Settings.CustomGeminiKey ?? "";
            TxtSettingsOpenAiKey.Text = _state.Settings.CustomOpenAiKey ?? "";
            TxtSettingsNvidiaKey.Text = _state.Settings.CustomNvidiaKey ?? "";
            TxtSettingsCustomBase.Text = _state.Settings.CustomOpenAiBase ?? "";

            // Bind chatbot bubbles
            LstChatBubbles.ItemsSource = _chatBubbles;
            
            // Add Welcome chat bubble
            _chatBubbles.Add(new ChatBubbleViewModel("Consultor Virtual", "Olá! Sou o seu Consultor Financeiro AI. Como posso te auxiliar a organizar suas economias hoje?", "Left", "#1e293b"));
        }

        private void RefreshAllLists()
        {
            // Summaries calculation
            decimal totalAccounts = _state.Accounts.Sum(a => a.Balance);
            decimal totalInvestments = _state.Investments.Sum(i => i.CurrentAmount);
            decimal totalDebts = _state.Creditors.Where(c => c.Status == "pending").Sum(c => c.Amount);

            string currency = _state.Settings.Currency == "USD" ? "$" : _state.Settings.Currency == "EUR" ? "€" : "R$";

            TxtDashTotalBalance.Text = $"{currency} {totalAccounts:N2}";
            TxtDashTotalInvested.Text = $"{currency} {totalInvestments:N2}";
            TxtDashTotalDebts.Text = $"{currency} {totalDebts:N2}";

            TxtDashAccountsCount.Text = $"{_state.Accounts.Count} contas ativas";
            TxtDashInvestmentsCount.Text = $"{_state.Investments.Count} ativos cadastrados";
            TxtDashDebtsStatus.Text = totalDebts > 5000 ? "Requer Atenção" : "Regular";

            // Bind Lists
            LstDashTransactions.ItemsSource = _state.Transactions.OrderByDescending(t => t.Date).Take(8).ToList();
            LstTransactions.ItemsSource = _state.Transactions.OrderByDescending(t => t.Date).ToList();
            
            LstDashGoals.ItemsSource = _state.Goals.ToList();
            LstDashCards.ItemsSource = _state.Cards.ToList();

            LstAccounts.ItemsSource = _state.Accounts.ToList();
            LstCards.ItemsSource = _state.Cards.ToList();
            LstInvestments.ItemsSource = _state.Investments.ToList();

            // Setup transactions combos
            CboNewTransAccount.ItemsSource = _state.Accounts.ToList();
            if (_state.Accounts.Count > 0)
            {
                CboNewTransAccount.SelectedIndex = 0;
            }
        }

        #endregion

        #region Navigation and Menu Routing

        private void HideAllViews()
        {
            ViewDashboard.Visibility = Visibility.Collapsed;
            ViewAccounts.Visibility = Visibility.Collapsed;
            ViewCards.Visibility = Visibility.Collapsed;
            ViewTransactions.Visibility = Visibility.Collapsed;
            ViewInvestments.Visibility = Visibility.Collapsed;
            ViewChat.Visibility = Visibility.Collapsed;
            ViewSettings.Visibility = Visibility.Collapsed;

            // Reset navigation button highlights
            var secondaryBrush = Application.Current.Resources["TextSecondary"] as Brush;
            BtnNavDashboard.Background = Brushes.Transparent;
            BtnNavDashboard.Foreground = secondaryBrush;

            BtnNavAccounts.Background = Brushes.Transparent;
            BtnNavAccounts.Foreground = secondaryBrush;

            BtnNavCards.Background = Brushes.Transparent;
            BtnNavCards.Foreground = secondaryBrush;

            BtnNavTransactions.Background = Brushes.Transparent;
            BtnNavTransactions.Foreground = secondaryBrush;

            BtnNavInvestments.Background = Brushes.Transparent;
            BtnNavInvestments.Foreground = secondaryBrush;

            BtnNavChat.Background = Brushes.Transparent;
            BtnNavChat.Foreground = secondaryBrush;

            BtnNavSettings.Background = Brushes.Transparent;
            BtnNavSettings.Foreground = secondaryBrush;
        }

        private void SetActiveTab(Grid targetGrid, Button targetButton)
        {
            HideAllViews();
            targetGrid.Visibility = Visibility.Visible;
            targetButton.Background = new SolidColorBrush(Color.FromRgb(30, 41, 59)); // Slate background highlight
            targetButton.Foreground = Brushes.White;
        }

        private void NavDashboard_Click(object sender, RoutedEventArgs e)
        {
            SetActiveTab(ViewDashboard, BtnNavDashboard);
            RefreshAllLists();
        }

        private void NavAccounts_Click(object sender, RoutedEventArgs e)
        {
            SetActiveTab(ViewAccounts, BtnNavAccounts);
        }

        private void NavCards_Click(object sender, RoutedEventArgs e)
        {
            SetActiveTab(ViewCards, BtnNavCards);
        }

        private void NavTransactions_Click(object sender, RoutedEventArgs e)
        {
            SetActiveTab(ViewTransactions, BtnNavTransactions);
        }

        private void NavInvestments_Click(object sender, RoutedEventArgs e)
        {
            SetActiveTab(ViewInvestments, BtnNavInvestments);
        }

        private void NavChat_Click(object sender, RoutedEventArgs e)
        {
            SetActiveTab(ViewChat, BtnNavChat);
        }

        private void NavSettings_Click(object sender, RoutedEventArgs e)
        {
            SetActiveTab(ViewSettings, BtnNavSettings);
        }

        #endregion

        #region Action Handlers (Add new, Save configs)

        private void BtnAddAccount_Click(object sender, RoutedEventArgs e)
        {
            string name = TxtNewAccName.Text.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                MessageBox.Show("Por favor insira o nome da conta.", "Erro", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string type = (CboNewAccType.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "checking";
            
            if (!decimal.TryParse(TxtNewAccBalance.Text, out decimal balance))
            {
                balance = 0;
            }

            var newAcc = new Account($"acc-{Guid.NewGuid().ToString().Substring(0, 6)}", name, type, balance, "#10b981");
            _state.Accounts.Add(newAcc);
            SaveState();
            RefreshAllLists();

            // Clear Input
            TxtNewAccName.Clear();
            TxtNewAccBalance.Text = "0";

            MessageBox.Show("Conta criada com sucesso!", "Sucesso", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void BtnAddCard_Click(object sender, RoutedEventArgs e)
        {
            string bank = TxtNewCardBank.Text.Trim();
            string name = TxtNewCardName.Text.Trim();

            if (string.IsNullOrWhiteSpace(bank) || string.IsNullOrWhiteSpace(name))
            {
                MessageBox.Show("Por favor, preencha os campos obrigatórios do cartão.", "Erro", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string brand = (CboNewCardBrand.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "visa";

            if (!decimal.TryParse(TxtNewCardLimit.Text, out decimal limit)) limit = 1000;
            if (!int.TryParse(TxtNewCardDue.Text, out int due)) due = 10;

            var newCard = new Card($"card-{Guid.NewGuid().ToString().Substring(0, 6)}", bank, name, brand, limit, Math.Max(1, due - 5), due, "#8b5cf6");
            _state.Cards.Add(newCard);
            SaveState();
            RefreshAllLists();

            // Clear inputs
            TxtNewCardBank.Clear();
            TxtNewCardName.Clear();
            TxtNewCardLimit.Text = "1000";
            TxtNewCardDue.Text = "10";

            MessageBox.Show("Cartão registrado!", "Sucesso", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void BtnAddTransaction_Click(object sender, RoutedEventArgs e)
        {
            if (_state.Accounts.Count == 0)
            {
                MessageBox.Show("Adicione pelo menos uma conta bancária antes de realizar transações.", "Sem Contas", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string desc = TxtNewTransDesc.Text.Trim();
            if (string.IsNullOrWhiteSpace(desc))
            {
                MessageBox.Show("Insira uma descrição válida.", "Erro", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (!decimal.TryParse(TxtNewTransAmount.Text, out decimal amount) || amount <= 0)
            {
                MessageBox.Show("Insira um valor numérico válido maior que zero.", "Erro", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string type = (CboNewTransType.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "expense";
            string category = TxtNewTransCategory.Text.Trim();
            if (string.IsNullOrWhiteSpace(category)) category = "Geral";

            string? accountId = CboNewTransAccount.SelectedValue?.ToString();
            if (string.IsNullOrEmpty(accountId)) return;

            // Deduct or add from account
            int accIdx = _state.Accounts.FindIndex(a => a.Id == accountId);
            if (accIdx != -1)
            {
                var targetAcc = _state.Accounts[accIdx];
                decimal adjust = type == "income" ? amount : -amount;
                _state.Accounts[accIdx] = targetAcc with { Balance = targetAcc.Balance + adjust };
            }

            var transaction = new Transaction(
                $"t-{Guid.NewGuid().ToString().Substring(0, 6)}",
                desc,
                amount,
                type,
                DateTime.Now.ToString("yyyy-MM-dd"),
                category,
                accountId
            );

            _state.Transactions.Add(transaction);
            SaveState();
            RefreshAllLists();

            // Clear Inputs
            TxtNewTransDesc.Clear();
            TxtNewTransAmount.Text = "0.00";
            TxtNewTransCategory.Clear();

            MessageBox.Show("Transação cadastrada com sucesso!", "Sucesso", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void BtnAddInvestment_Click(object sender, RoutedEventArgs e)
        {
            string name = TxtNewInvName.Text.Trim();
            string type = TxtNewInvType.Text.Trim();

            if (string.IsNullOrWhiteSpace(name))
            {
                MessageBox.Show("Por favor insira o nome do ativo.", "Erro", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            decimal.TryParse(TxtNewInvInvested.Text, out decimal invested);
            decimal.TryParse(TxtNewInvCurrent.Text, out decimal current);
            decimal.TryParse(TxtNewInvRate.Text, out decimal rate);

            var newInv = new Investment(
                $"inv-{Guid.NewGuid().ToString().Substring(0, 6)}",
                name,
                type,
                invested,
                current,
                rate,
                0,
                DateTime.Now.ToString("yyyy-MM-dd")
            );

            _state.Investments.Add(newInv);
            SaveState();
            RefreshAllLists();

            TxtNewInvName.Clear();
            TxtNewInvType.Clear();
            TxtNewInvInvested.Text = "0.00";
            TxtNewInvCurrent.Text = "0.00";
            TxtNewInvRate.Text = "10.00";

            MessageBox.Show("Ativo adicionado ao portfólio!", "Sucesso", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void BtnSaveSettings_Click(object sender, RoutedEventArgs e)
        {
            string user = TxtSettingsUser.Text.Trim();
            if (string.IsNullOrWhiteSpace(user)) user = "Usuário C#";

            string currency = (CboSettingsCurrency.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "BRL";
            string provider = (CboSettingsProvider.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "gemini";
            string model = TxtSettingsModel.Text.Trim();

            _state = _state with
            {
                Settings = _state.Settings with
                {
                    UserName = user,
                    Currency = currency,
                    SelectedProvider = provider,
                    SelectedModel = model,
                    CustomGeminiKey = TxtSettingsGeminiKey.Text.Trim(),
                    CustomOpenAiKey = TxtSettingsOpenAiKey.Text.Trim(),
                    CustomNvidiaKey = TxtSettingsNvidiaKey.Text.Trim(),
                    CustomOpenAiBase = TxtSettingsCustomBase.Text.Trim()
                }
            };

            SaveState();
            RefreshAllLists();
            
            TxtFooterUserName.Text = user;

            MessageBox.Show("Configurações atualizadas!", "Sucesso", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void CboSettingsProvider_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (PanelGeminiCreds == null || PanelOpenAiCreds == null || PanelNvidiaCreds == null || PanelCustomCreds == null) return;

            string selectedTag = (CboSettingsProvider.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "gemini";

            PanelGeminiCreds.Visibility = Visibility.Collapsed;
            PanelOpenAiCreds.Visibility = Visibility.Collapsed;
            PanelNvidiaCreds.Visibility = Visibility.Collapsed;
            PanelCustomCreds.Visibility = Visibility.Collapsed;

            if (selectedTag == "gemini")
            {
                PanelGeminiCreds.Visibility = Visibility.Visible;
                TxtSettingsModel.Text = "gemini-2.5-flash";
            }
            else if (selectedTag == "openai")
            {
                PanelOpenAiCreds.Visibility = Visibility.Visible;
                TxtSettingsModel.Text = "gpt-4o-mini";
            }
            else if (selectedTag == "nvidia")
            {
                PanelNvidiaCreds.Visibility = Visibility.Visible;
                TxtSettingsModel.Text = "meta/llama-3.1-70b-instruct";
            }
            else if (selectedTag == "custom_openai")
            {
                PanelCustomCreds.Visibility = Visibility.Visible;
                TxtSettingsModel.Text = "custom-model-name";
            }
        }

        #endregion

        #region Interactive AI Advisor Chat

        private void CboChatAgent_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (_state == null) return;
            string selectedAgent = (CboChatAgent.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "default";
            _state = _state with { Settings = _state.Settings with { SelectedAgent = selectedAgent } };
            SaveState();
        }

        private async void BtnSendChat_Click(object sender, RoutedEventArgs e)
        {
            await SendChatMessageAsync();
        }

        private async void TxtChatMsg_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                await SendChatMessageAsync();
            }
        }

        private async Task SendChatMessageAsync()
        {
            string msg = TxtChatMsg.Text.Trim();
            if (string.IsNullOrWhiteSpace(msg)) return;

            TxtChatMsg.Clear();

            // Add user bubble
            _chatBubbles.Add(new ChatBubbleViewModel("Você", msg, "Right", "#3b82f6"));
            ScrollChat.ScrollToEnd();

            // Setup temporary thinking indicator
            var thinkingBubble = new ChatBubbleViewModel("IA", "Pensando...", "Left", "#1e293b");
            _chatBubbles.Add(thinkingBubble);
            ScrollChat.ScrollToEnd();

            string currentAgent = (CboChatAgent.SelectedItem as ComboBoxItem)?.Tag.ToString() ?? "default";
            string currentProvider = _state.Settings.SelectedProvider ?? "gemini";
            string currentModel = _state.Settings.SelectedModel ?? "gemini-2.5-flash";

            var req = new AiChatRequest(
                Message: msg,
                History: _aiHistory,
                FinancialData: _state,
                CustomGeminiKey: _state.Settings.CustomGeminiKey,
                SelectedModel: currentModel,
                SelectedAgent: currentAgent,
                SelectedProvider: currentProvider,
                CustomOpenAiKey: _state.Settings.CustomOpenAiKey,
                CustomNvidiaKey: _state.Settings.CustomNvidiaKey,
                CustomOpenAiBase: _state.Settings.CustomOpenAiBase,
                CustomOpenAiModel: _state.Settings.CustomOpenAiModel
            );

            string? serverKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");

            try
            {
                var response = await _aiService.ProcessChatRequestAsync(req, serverKey);

                // Replace thinking indicator with real response
                _chatBubbles.Remove(thinkingBubble);
                _chatBubbles.Add(new ChatBubbleViewModel("Consultor Virtual", response.Text, "Left", "#1e293b"));
                
                // Add to history
                _aiHistory.Add(new AiChatMessage("user", msg));
                _aiHistory.Add(new AiChatMessage("assistant", response.Text));
            }
            catch (Exception ex)
            {
                _chatBubbles.Remove(thinkingBubble);
                _chatBubbles.Add(new ChatBubbleViewModel("Consultor Virtual", $"Ocorreu um erro: {ex.Message}", "Left", "#7f1d1d"));
            }

            ScrollChat.ScrollToEnd();
        }

        #endregion
    }

    #region Converter Classes for Beautiful UI Bindings

    public class TypeToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            string type = value?.ToString() ?? "expense";
            return type switch
            {
                "income" => new SolidColorBrush(Color.FromRgb(16, 185, 129)), // Green
                "refund" => new SolidColorBrush(Color.FromRgb(59, 130, 246)),  // Blue
                _ => new SolidColorBrush(Color.FromRgb(239, 68, 68))           // Red
            };
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class TypeToValueColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            string type = value?.ToString() ?? "expense";
            return type switch
            {
                "income" => new SolidColorBrush(Color.FromRgb(16, 185, 129)), // Green
                "refund" => new SolidColorBrush(Color.FromRgb(59, 130, 246)),  // Blue
                _ => new SolidColorBrush(Color.FromRgb(239, 68, 68))           // Red
            };
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    #endregion

    #region Helper ViewModels

    public class ChatBubbleViewModel
    {
        public string Sender { get; set; }
        public string Text { get; set; }
        public string Alignment { get; set; }
        public SolidColorBrush BackgroundBrush { get; set; }

        public ChatBubbleViewModel(string sender, string text, string alignment, string hexColor)
        {
            Sender = sender;
            Text = text;
            Alignment = alignment;
            BackgroundBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString(hexColor));
        }
    }

    #endregion
}
