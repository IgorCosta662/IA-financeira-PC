using System.Text.Json.Serialization;

namespace FinancaAIDesktop.Models
{
    public record Account(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("type")] string Type, // "checking" | "savings" | "digital_wallet" | "cash"
        [property: JsonPropertyName("balance")] decimal Balance,
        [property: JsonPropertyName("color")] string Color
    );

    public record Card(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("bank")] string Bank,
        [property: JsonPropertyName("cardName")] string CardName,
        [property: JsonPropertyName("brand")] string Brand, // "visa" | "mastercard" | "elo" | "amex"
        [property: JsonPropertyName("limit")] decimal Limit,
        [property: JsonPropertyName("closingDay")] int ClosingDay,
        [property: JsonPropertyName("dueDay")] int DueDay,
        [property: JsonPropertyName("color")] string Color
    );

    public record Transaction(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("description")] string Description,
        [property: JsonPropertyName("amount")] decimal Amount,
        [property: JsonPropertyName("type")] string Type, // "income" | "expense" | "transfer" | "refund"
        [property: JsonPropertyName("date")] string Date, // YYYY-MM-DD
        [property: JsonPropertyName("category")] string Category,
        [property: JsonPropertyName("accountId")] string AccountId,
        [property: JsonPropertyName("cardId")] string? CardId = null,
        [property: JsonPropertyName("installmentsCount")] int? InstallmentsCount = null,
        [property: JsonPropertyName("currentInstallment")] int? CurrentInstallment = null,
        [property: JsonPropertyName("originalTransactionId")] string? OriginalTransactionId = null
    );

    public record Investment(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("investedAmount")] decimal InvestedAmount,
        [property: JsonPropertyName("currentAmount")] decimal CurrentAmount,
        [property: JsonPropertyName("yieldRate")] decimal YieldRate,
        [property: JsonPropertyName("dividendsReceived")] decimal DividendsReceived,
        [property: JsonPropertyName("purchaseDate")] string PurchaseDate
    );

    public record Debtor(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("amount")] decimal Amount,
        [property: JsonPropertyName("date")] string Date,
        [property: JsonPropertyName("observation")] string Observation,
        [property: JsonPropertyName("status")] string Status // "received" | "pending" | "overdue"
    );

    public record Creditor(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("creditor")] string CreditorName,
        [property: JsonPropertyName("amount")] decimal Amount,
        [property: JsonPropertyName("date")] string Date,
        [property: JsonPropertyName("installmentsCount")] int InstallmentsCount,
        [property: JsonPropertyName("currentInstallment")] int CurrentInstallment,
        [property: JsonPropertyName("interestRate")] decimal InterestRate,
        [property: JsonPropertyName("status")] string Status // "paid" | "pending"
    );

    public record Goal(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("targetAmount")] decimal TargetAmount,
        [property: JsonPropertyName("currentAmount")] decimal CurrentAmount,
        [property: JsonPropertyName("deadline")] string Deadline,
        [property: JsonPropertyName("category")] string Category
    );

    public record AppSettings(
        [property: JsonPropertyName("userName")] string UserName,
        [property: JsonPropertyName("currency")] string Currency, // "BRL" | "USD" | "EUR"
        [property: JsonPropertyName("hideBalanceDefault")] bool HideBalanceDefault,
        [property: JsonPropertyName("themeColor")] string ThemeColor, // "blue" | "purple" | "emerald" | "slate"
        [property: JsonPropertyName("customGeminiKey")] string? CustomGeminiKey = null,
        [property: JsonPropertyName("selectedModel")] string? SelectedModel = null,
        [property: JsonPropertyName("selectedAgent")] string? SelectedAgent = null,
        [property: JsonPropertyName("selectedProvider")] string? SelectedProvider = null, // "gemini" | "openai" | "nvidia" | "custom_openai"
        [property: JsonPropertyName("customOpenAiKey")] string? CustomOpenAiKey = null,
        [property: JsonPropertyName("customNvidiaKey")] string? CustomNvidiaKey = null,
        [property: JsonPropertyName("customOpenAiBase")] string? CustomOpenAiBase = null,
        [property: JsonPropertyName("customOpenAiModel")] string? CustomOpenAiModel = null
    );

    public record SecuritySettings(
        [property: JsonPropertyName("pinEnabled")] bool PinEnabled,
        [property: JsonPropertyName("pinCode")] string PinCode,
        [property: JsonPropertyName("isLocked")] bool IsLocked
    );

    public record FinancialState(
        [property: JsonPropertyName("accounts")] List<Account> Accounts,
        [property: JsonPropertyName("cards")] List<Card> Cards,
        [property: JsonPropertyName("transactions")] List<Transaction> Transactions,
        [property: JsonPropertyName("investments")] List<Investment> Investments,
        [property: JsonPropertyName("debtors")] List<Debtor> Debtors,
        [property: JsonPropertyName("creditors")] List<Creditor> Creditors,
        [property: JsonPropertyName("goals")] List<Goal> Goals,
        [property: JsonPropertyName("settings")] AppSettings Settings,
        [property: JsonPropertyName("security")] SecuritySettings Security
    );

    public record AiChatRequest(
        [property: JsonPropertyName("message")] string Message,
        [property: JsonPropertyName("history")] List<AiChatMessage> History,
        [property: JsonPropertyName("financialData")] FinancialState? FinancialData = null,
        [property: JsonPropertyName("customGeminiKey")] string? CustomGeminiKey = null,
        [property: JsonPropertyName("selectedModel")] string? SelectedModel = null,
        [property: JsonPropertyName("selectedAgent")] string? SelectedAgent = null,
        [property: JsonPropertyName("selectedProvider")] string? SelectedProvider = null,
        [property: JsonPropertyName("customOpenAiKey")] string? CustomOpenAiKey = null,
        [property: JsonPropertyName("customNvidiaKey")] string? CustomNvidiaKey = null,
        [property: JsonPropertyName("customOpenAiBase")] string? CustomOpenAiBase = null,
        [property: JsonPropertyName("customOpenAiModel")] string? CustomOpenAiModel = null
    );

    public record AiChatMessage(
        [property: JsonPropertyName("role")] string Role, // "user" | "model" | "assistant"
        [property: JsonPropertyName("text")] string Text
    );

    public record AiChatResponse(
        [property: JsonPropertyName("text")] string Text
    );
}
