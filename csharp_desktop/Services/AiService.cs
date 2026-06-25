using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using FinancaAIDesktop.Models;

namespace FinancaAIDesktop.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;

        public AiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<AiChatResponse> ProcessChatRequestAsync(AiChatRequest request, string? serverGeminiKey)
        {
            string systemInstruction = BuildSystemInstructions(request);
            string provider = request.SelectedProvider ?? "gemini";

            if (provider == "gemini")
            {
                return await CallGeminiApiAsync(request, systemInstruction, serverGeminiKey);
            }
            else
            {
                return await CallOpenAiCompatibleApiAsync(request, systemInstruction, provider);
            }
        }

        private string BuildSystemInstructions(AiChatRequest request)
        {
            string agentInstructions = "";
            string agent = request.SelectedAgent ?? "default";

            if (agent == "investor")
            {
                agentInstructions = @"Você é o 'Investidor Arrojado' (Tony). Você é dinâmico, focado em alta rentabilidade, investimentos arrojados, fundos imobiliários, renda variável, criptomoedas e diversificação agressiva de portfólio.
Use um tom confiante, direto ao ponto, com jargões do mercado financeiro e metáforas de crescimento acelerado. Seu objetivo é fazer o usuário pensar grande e otimizar cada centavo para gerar dividendos futuros.";
            }
            else if (agent == "poupador")
            {
                agentInstructions = @"Você é o 'Poupador Conservador' (Sr. Silas). Você é extremamente cauteloso, focado em segurança, preservação de capital, liquidez diária, juros compostos de renda fixa (CDB, Tesouro Selic, Poupança inteligente) e eliminação total de riscos.
Use um tom acolhedor, paternal, sábio e muito prudente. Ensine o usuário a criar uma reserva de emergência robusta antes de qualquer coisa, alertando sempre sobre os perigos da especulação financeira.";
            }
            else if (agent == "educador")
            {
                agentInstructions = @"Você é a 'Professora de Finanças' (Sofia). Você é altamente didática, paciente, explicativa e focada em organização pessoal, psicologia financeira, consumo consciente e planejamento de longo prazo.
Use analogias cotidianas simples, explique termos complexos de forma descomplicada, seja encorajadora e use listas com passo a passo. Seu objetivo é educar financeiramente para que o usuário tome decisões autônomas e saudáveis.";
            }
            else if (agent == "psicologo")
            {
                agentInstructions = @"Você é o 'Terapeuta Financeiro' (Dr. Arthur). Você foca na relação emocional do usuário com o dinheiro, crenças limitantes sobre riqueza, estresse causado por dívidas, ansiedade de consumo e bem-estar mental.
Use um tom empático, calmo, focado em escuta ativa, sem julgamentos, e ajude o usuário a refletir sobre os gatilhos emocionais que o levam a gastar impulsivamente. Seu foco é a paz de espírito.";
            }
            else if (agent == "nerd")
            {
                agentInstructions = @"Você é o 'Analista Quantitativo' (Nerd dos Números). Você é extremamente pragmático, obcecado por estatísticas, fórmulas matemáticas, gráficos hipotéticos, taxas de juros, inflação acumulada e tabelas comparativas.
Não faça rodeios emocionais. Trate tudo como equações puras. Use formatação de código se útil e liste cálculos detalhados para embasar suas teses.";
            }
            else
            {
                agentInstructions = @"Você é o 'Consultor Financeiro Padrão' (Dr. Finança). Você é equilibrado, profissional, amigável e oferece conselhos estratégicos realistas e de fácil compreensão.";
            }

            string contextDataText = "Nenhum dado financeiro disponível no momento.";
            if (request.FinancialData != null)
            {
                var sb = new StringBuilder();
                sb.AppendLine($"[Contexto Financeiro do Usuário - Nome: {request.FinancialData.Settings?.UserName ?? "Usuário"}]");
                
                decimal totalBalance = 0;
                if (request.FinancialData.Accounts != null)
                {
                    sb.AppendLine("- Contas Bancárias:");
                    foreach (var acc in request.FinancialData.Accounts)
                    {
                        sb.AppendLine($"  * {acc.Name} ({acc.Type}): {request.FinancialData.Settings?.Currency} {acc.Balance:N2}");
                        totalBalance += acc.Balance;
                    }
                }
                sb.AppendLine($"  * Saldo Total em Contas: {request.FinancialData.Settings?.Currency} {totalBalance:N2}");

                if (request.FinancialData.Cards != null && request.FinancialData.Cards.Count > 0)
                {
                    sb.AppendLine("- Cartões de Crédito:");
                    foreach (var card in request.FinancialData.Cards)
                    {
                        sb.AppendLine($"  * {card.Bank} {card.CardName} ({card.Brand}): Limite {request.FinancialData.Settings?.Currency} {card.Limit:N2}");
                    }
                }

                if (request.FinancialData.Investments != null && request.FinancialData.Investments.Count > 0)
                {
                    decimal totalInvested = 0;
                    decimal totalCurrent = 0;
                    sb.AppendLine("- Investimentos:");
                    foreach (var inv in request.FinancialData.Investments)
                    {
                        sb.AppendLine($"  * {inv.Name} ({inv.Type}): Investido: {inv.InvestedAmount:N2} | Atual: {inv.CurrentAmount:N2} (Rendimento anual: {inv.YieldRate}%)");
                        totalInvested += inv.InvestedAmount;
                        totalCurrent += inv.CurrentAmount;
                    }
                }

                if (request.FinancialData.Goals != null && request.FinancialData.Goals.Count > 0)
                {
                    sb.AppendLine("- Metas Financeiras:");
                    foreach (var goal in request.FinancialData.Goals)
                    {
                        sb.AppendLine($"  * {goal.Name}: Economizado {goal.CurrentAmount:N2} de {goal.TargetAmount:N2}");
                    }
                }

                if (request.FinancialData.Transactions != null && request.FinancialData.Transactions.Count > 0)
                {
                    sb.AppendLine("- Últimas Transações:");
                    int count = 0;
                    foreach (var t in request.FinancialData.Transactions)
                    {
                        if (count++ >= 15) break;
                        sb.AppendLine($"  * [{t.Date}] {t.Description} -> {request.FinancialData.Settings?.Currency} {t.Amount:N2} [{t.Type}]");
                    }
                }

                contextDataText = sb.ToString();
            }

            return @$"Você é o Consultor Virtual Inteligente integrado ao painel Finança AI. Seu objetivo principal é fornecer orientações financeiras, estratégias de economia, insights de investimentos e respostas úteis baseadas no perfil e dados reais do usuário fornecidos no contexto.

[INSTRUÇÕES ESPECÍFICAS DA SUA PERSONALIDADE DE AGENTE]:
{agentInstructions}

[DADOS EM TEMPO REAL DO USUÁRIO]:
{contextDataText}

[DIRETRIZES GERAIS IMPORTANTES]:
1. Forneça conselhos realistas baseados nos dados fornecidos do usuário (se houver).
2. Seja proativo e sugira formas práticas de economizar, gerenciar dívidas ou organizar orçamentos.
3. Jamais sugira investimentos fraudulentos ou especulação agressiva nociva.
4. Utilize formatação Markdown limpa (tabelas, listas ou negritos) para tornar as respostas altamente escaneáveis.";
        }

        private async Task<AiChatResponse> CallGeminiApiAsync(AiChatRequest request, string systemInstruction, string? serverGeminiKey)
        {
            string apiKey = (!string.IsNullOrWhiteSpace(request.CustomGeminiKey) ? request.CustomGeminiKey : serverGeminiKey ?? "").Trim();
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return new AiChatResponse("Chave de API do Gemini não configurada. Por favor, configure sua chave no painel de Configurações.");
            }

            string model = request.SelectedModel ?? "gemini-2.5-flash";
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var historyText = new StringBuilder();
            if (request.History != null && request.History.Count > 0)
            {
                foreach (var h in request.History)
                {
                    string speaker = h.Role == "user" ? "Usuário" : "Consultor";
                    historyText.AppendLine($"{speaker}: {h.Text}");
                }
                historyText.AppendLine();
            }
            historyText.AppendLine($"Nova Dúvida: {request.Message}");

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[]
                        {
                            new { text = historyText.ToString() }
                        }
                    }
                },
                systemInstruction = new
                {
                    parts = new[]
                    {
                        new { text = systemInstruction }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7
                }
            };

            try
            {
                var response = await _httpClient.PostAsJsonAsync(url, requestBody);
                if (!response.IsSuccessStatusCode)
                {
                    string errorMsg = await response.Content.ReadAsStringAsync();
                    return new AiChatResponse($"Erro na API do Gemini ({response.StatusCode}): {errorMsg}");
                }

                using var doc = await response.Content.ReadFromJsonAsync<JsonDocument>();
                var text = doc?.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return new AiChatResponse(text ?? "Desculpe, o modelo não retornou conteúdo.");
            }
            catch (Exception ex)
            {
                return new AiChatResponse($"Exceção ao chamar a API do Gemini: {ex.Message}");
            }
        }

        private async Task<AiChatResponse> CallOpenAiCompatibleApiAsync(AiChatRequest request, string systemInstruction, string provider)
        {
            string apiKey = "";
            string apiBase = "";
            string modelToUse = "";

            if (provider == "openai")
            {
                apiKey = (request.CustomOpenAiKey ?? "").Trim();
                apiBase = "https://api.openai.com/v1/chat/completions";
                modelToUse = request.SelectedModel ?? "gpt-4o-mini";
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    return new AiChatResponse("Chave de API da OpenAI não configurada.");
                }
            }
            else if (provider == "nvidia")
            {
                apiKey = (request.CustomNvidiaKey ?? "").Trim();
                apiBase = "https://integrate.api.nvidia.com/v1/chat/completions";
                modelToUse = request.SelectedModel ?? "meta/llama-3.1-70b-instruct";
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    return new AiChatResponse("Chave de API da NVIDIA não configurada.");
                }
            }
            else if (provider == "custom_openai")
            {
                apiKey = (!string.IsNullOrWhiteSpace(request.CustomOpenAiKey) ? request.CustomOpenAiKey : request.CustomNvidiaKey ?? "").Trim();
                apiBase = (request.CustomOpenAiBase ?? "").Trim();
                modelToUse = (request.CustomOpenAiModel ?? "").Trim();

                if (string.IsNullOrWhiteSpace(apiBase))
                {
                    return new AiChatResponse("Base URL do provedor customizado não está configurada.");
                }

                if (!apiBase.EndsWith("/chat/completions"))
                {
                    if (apiBase.EndsWith("/"))
                        apiBase += "chat/completions";
                    else if (apiBase.EndsWith("/v1"))
                        apiBase += "/chat/completions";
                    else
                        apiBase += "/v1/chat/completions";
                }
            }

            var messages = new List<object>
            {
                new { role = "system", content = systemInstruction }
            };

            if (request.History != null)
            {
                foreach (var h in request.History)
                {
                    messages.Add(new
                    {
                        role = h.Role == "user" ? "user" : "assistant",
                        content = h.Text
                    });
                }
            }

            messages.Add(new { role = "user", content = request.Message });

            var requestBody = new
            {
                model = modelToUse,
                messages = messages,
                temperature = 0.7
            };

            try
            {
                var httpRequest = new HttpRequestMessage(HttpMethod.Post, apiBase);
                httpRequest.Headers.Add("Authorization", $"Bearer {apiKey}");
                httpRequest.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(httpRequest);
                if (!response.IsSuccessStatusCode)
                {
                    string errorMsg = await response.Content.ReadAsStringAsync();
                    return new AiChatResponse($"Erro na API ({provider}): {response.StatusCode} - {errorMsg}");
                }

                using var doc = await response.Content.ReadFromJsonAsync<JsonDocument>();
                var text = doc?.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return new AiChatResponse(text ?? "Desculpe, o modelo não retornou conteúdo.");
            }
            catch (Exception ex)
            {
                return new AiChatResponse($"Exceção ao chamar a API ({provider}): {ex.Message}");
            }
        }
    }
}
