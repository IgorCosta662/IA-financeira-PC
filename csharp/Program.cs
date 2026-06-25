using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using FinancaAI.Models;
using FinancaAI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "Finança AI Ultimate API", Version = "v1", Description = "Backend robusto em C# para o ecossistema Finança AI" });
});

// Configure CORS to allow the React app to communicate with C# backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register HttpClient and the AI Service
builder.Services.AddHttpClient();
builder.Services.AddScoped<AiService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment() || true) // Enable Swagger in all environments for ease of testing in this container
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Finança AI API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");

const string StateFilePath = "state.json";

// Helper to load financial state
FinancialState LoadState()
{
    if (!File.Exists(StateFilePath))
    {
        // Return a fresh initial state
        return new FinancialState(
            Accounts: new List<Account>(),
            Cards: new List<Card>(),
            Transactions: new List<Transaction>(),
            Investments: new List<Investment>(),
            Debtors: new List<Debtor>(),
            Creditors: new List<Creditor>(),
            Goals: new List<Goal>(),
            Settings: new AppSettings("Usuário C#", "BRL", false, "blue"),
            Security: new SecuritySettings(false, "", false)
        );
    }

    try
    {
        string json = File.ReadAllText(StateFilePath);
        return JsonSerializer.Deserialize<FinancialState>(json) ?? LoadState();
    }
    catch
    {
        return new FinancialState(
            Accounts: new List<Account>(),
            Cards: new List<Card>(),
            Transactions: new List<Transaction>(),
            Investments: new List<Investment>(),
            Debtors: new List<Debtor>(),
            Creditors: new List<Creditor>(),
            Goals: new List<Goal>(),
            Settings: new AppSettings("Usuário C#", "BRL", false, "blue"),
            Security: new SecuritySettings(false, "", false)
        );
    }
}

// Helper to save financial state
void SaveState(FinancialState state)
{
    string json = JsonSerializer.Serialize(state, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText(StateFilePath, json);
}

#region API Endpoints

// Root welcome message
app.MapGet("/", () => Results.Ok(new { message = "Bem-vindo ao Finança AI Ultimate C# Backend!", version = "1.0.0", swagger = "/swagger" }));

// GET complete financial state
app.MapGet("/api/state", () => Results.Ok(LoadState()))
   .WithName("GetFinancialState")
   .WithOpenApi();

// POST save complete financial state
app.MapPost("/api/state", (FinancialState state) =>
{
    SaveState(state);
    return Results.Ok(new { success = true, message = "Estado financeiro salvo com sucesso!" });
})
.WithName("SaveFinancialState")
.WithOpenApi();

// GET Accounts
app.MapGet("/api/accounts", () => Results.Ok(LoadState().Accounts))
   .WithName("GetAccounts")
   .WithOpenApi();

// POST Add Account
app.MapPost("/api/accounts", (Account account) =>
{
    var state = LoadState();
    state.Accounts.RemoveAll(a => a.Id == account.Id);
    state.Accounts.Add(account);
    SaveState(state);
    return Results.Created($"/api/accounts/{account.Id}", account);
})
.WithName("AddAccount")
.WithOpenApi();

// GET Cards
app.MapGet("/api/cards", () => Results.Ok(LoadState().Cards))
   .WithName("GetCards")
   .WithOpenApi();

// POST Add Card
app.MapPost("/api/cards", (Card card) =>
{
    var state = LoadState();
    state.Cards.RemoveAll(c => c.Id == card.Id);
    state.Cards.Add(card);
    SaveState(state);
    return Results.Created($"/api/cards/{card.Id}", card);
})
.WithName("AddCard")
.WithOpenApi();

// GET Transactions
app.MapGet("/api/transactions", () => Results.Ok(LoadState().Transactions))
   .WithName("GetTransactions")
   .WithOpenApi();

// POST Add Transaction
app.MapPost("/api/transactions", (Transaction transaction) =>
{
    var state = LoadState();
    state.Transactions.RemoveAll(t => t.Id == transaction.Id);
    state.Transactions.Add(transaction);
    SaveState(state);
    return Results.Created($"/api/transactions/{transaction.Id}", transaction);
})
.WithName("AddTransaction")
.WithOpenApi();

// POST chat endpoint mirroring server.ts exactly
app.MapPost("/api/gemini/chat", async (AiChatRequest request, AiService aiService, IConfiguration configuration) =>
{
    if (string.IsNullOrWhiteSpace(request.Message))
    {
        return Results.BadRequest(new { error = "Mensagem é obrigatória." });
    }

    // Get key from environment if not supplied in client request
    string? serverGeminiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
                              ?? configuration["GEMINI_API_KEY"];

    AiChatResponse response = await aiService.ProcessChatRequestAsync(request, serverGeminiKey);
    return Results.Json(response);
})
.WithName("AiChat")
.WithOpenApi();

#endregion

// Start the server
// Note: ASP.NET Core by default reads ASPNETCORE_URLS to bind. We expose on localhost for local dev.
app.Run();
