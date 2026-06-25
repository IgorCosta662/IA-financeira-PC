import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory simulated cloud database for backups
let cloudBackupData: any = null;

// Initialize GoogleGenAI client lazily to prevent crash if key is missing on start
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------- API ROUTES -----------------

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Cloud Backup Endpoints
app.post('/api/backup/save', (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Nenhum dado enviado para backup.' });
    }
    cloudBackupData = {
      timestamp: new Date().toISOString(),
      payload: data
    };
    res.json({ success: true, timestamp: cloudBackupData.timestamp, message: 'Backup salvo na nuvem com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao salvar o backup na nuvem.' });
  }
});

app.get('/api/backup/load', (req, res) => {
  try {
    if (!cloudBackupData) {
      return res.status(404).json({ error: 'Nenhum backup em nuvem encontrado.' });
    }
    res.json({ success: true, backup: cloudBackupData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao carregar o backup na nuvem.' });
  }
});

// Gemini/OpenAI/Nvidia AI Chat Advisor API
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { 
      message, 
      history, 
      financialData, 
      customGeminiKey, 
      selectedModel, 
      selectedAgent,
      selectedProvider,
      customOpenAiKey,
      customNvidiaKey,
      customOpenAiBase,
      customOpenAiModel
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }

    // Custom agent personality prompts
    let agentInstructions = '';
    if (selectedAgent === 'investor') {
      agentInstructions = `Você é um Especialista de Investimentos (Sênior Wealth Manager). Seu foco é agressivo na multiplicação de patrimônio, juros compostos, alocação inteligente de ativos (renda fixa, ações, FIIs), diversificação e metas de longo prazo para independência financeira. Incentive o reinvestimento de dividendos e avalie o risco das opções de investimento de forma analítica e estratégica.`;
    } else if (selectedAgent === 'frugal') {
      agentInstructions = `Você é o Coach do Milhão, um economista de comportamento e poupador extremo. Você é amigável, mas extremamente rigoroso com pequenas despesas cotidianas! Critica de forma bem-humorada gastos supérfluos, como cafezinhos diários, assinaturas não utilizadas, delivery de comida frequente ou corridas desnecessárias de aplicativo. Sua missão é fazer o usuário economizar cada centavo possível para investir no futuro. Diga coisas engraçadas sobre 'cortar o supérfluo'.`;
    } else if (selectedAgent === 'academic') {
      agentInstructions = `Você é um Analista de Finanças Acadêmico e Científico. Suas respostas devem ser extremamente técnicas, matemáticas, utilizando fórmulas e modelos consagrados (Regra 50/30/20, taxa de poupança, índices de liquidez). Faça cálculos precisos baseados nos dados fornecidos e entregue relatórios estruturados e ricos em estatísticas financeiras.`;
    } else if (selectedAgent === 'friendly') {
      agentInstructions = `Você é um Amigo Conselheiro e Terapeuta Financeiro. Você sabe que lidar com dinheiro causa ansiedade e estresse. Seja extremamente empático, gentil, caloroso e encorajador. Foque em paz de espírito, saúde mental e na construção de hábitos saudáveis sem culpa ou cobranças excessivas. Comemore cada pequena vitória do usuário (como guardar R$ 10 ou pagar uma fatura).`;
    } else {
      agentInstructions = `Você é o Consultor Financeiro Inteligente padrão do Finança AI Ultimate. Seu tom é simpático, profissional, encorajador e direto. Equilibre o controle de gastos diários, investimentos saudáveis, quitação de dívidas e planejamento de longo prazo de forma harmoniosa.`;
    }

    // Build context prompt with current financial data
    const accountsInfo = financialData.accounts?.map((a: any) => `- ${a.name} (${a.type}): R$ ${a.balance.toFixed(2)}`).join('\n') || 'Nenhuma';
    const cardsInfo = financialData.cards?.map((c: any) => `- ${c.bank} ${c.cardName}: Limite R$ ${c.limit.toFixed(2)}`).join('\n') || 'Nenhum';
    const investmentsInfo = financialData.investments?.map((i: any) => `- ${i.name} (${i.type}): R$ ${i.currentAmount.toFixed(2)} (Rendimento: ${i.yieldRate}%)`).join('\n') || 'Nenhum';
    const debtorsInfo = financialData.debtors?.map((d: any) => `- ${d.name}: R$ ${d.amount.toFixed(2)} (${d.status})`).join('\n') || 'Nenhum';
    const creditorsInfo = financialData.creditors?.map((c: any) => `- ${c.creditor}: R$ ${c.amount.toFixed(2)} (${c.currentInstallment}/${c.installmentsCount} parcelas)`).join('\n') || 'Nenhum';
    const goalsInfo = financialData.goals?.map((g: any) => `- Meta ${g.name}: Alvo R$ ${g.targetAmount.toFixed(2)} (Atual: R$ ${g.currentAmount.toFixed(2)})`).join('\n') || 'Nenhuma';

    // Calculate sum of credit card future installments to give deep foresight
    const futureSummary = financialData.futureSummary || {};

    const systemInstruction = `Você é o Consultor Financeiro Inteligente do Finança AI Ultimate.
${agentInstructions}

Você tem acesso em tempo real aos dados financeiros do usuário (fornecidos abaixo).

CONTEXTO FINANCEIRO DO USUÁRIO:
--- CONTAS BANCÁRIAS ---
${accountsInfo}

--- CARTÕES DE CRÉDITO ---
${cardsInfo}

--- INVESTIMENTOS ---
${investmentsInfo}

--- QUEM DEVE AO USUÁRIO ---
${debtorsInfo}

--- QUEM O USUÁRIO DEVE ---
${creditorsInfo}

--- METAS FINANCEIRAS ---
${goalsInfo}

--- PREVISÕES E COMPROMISSOS FUTUROS ---
Próximo mês estimado de despesa: R$ ${futureSummary.nextMonthTotal || 'Não calculado'}
Próximos 3 meses acumulados: R$ ${futureSummary.threeMonthsTotal || 'Não calculado'}
Próximos 6 meses acumulados: R$ ${futureSummary.sixMonthsTotal || 'Não calculado'}
Próximos 12 meses acumulados: R$ ${futureSummary.twelveMonthsTotal || 'Não calculado'}

INSTRUÇÕES DE COMPORTAMENTO:
1. Responda em Português do Brasil de acordo com sua personalidade definida.
2. Analise os gastos e faça sugestões inteligentes baseadas em regras consagradas (como a regra 50/30/20).
3. Se o usuário perguntar se pode comprar algo, faça uma simulação baseada no saldo disponível, as faturas futuras de cartão e os investimentos que ele tem.
4. Identifique despesas desnecessárias ou recorrentes que parecem duplicadas ou excessivas.
5. Seja focado em soluções práticas para quitar dívidas e economizar. Utilize formatação Markdown limpa (tabelas, listas ou negritos) para tornar as respostas altamente escaneáveis.`;

    const provider = selectedProvider || 'gemini';

    if (provider === 'gemini') {
      // Determine GenAI client to use
      let ai: GoogleGenAI;
      if (customGeminiKey && customGeminiKey.trim() !== '') {
        ai = new GoogleGenAI({
          apiKey: customGeminiKey.trim(),
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } else {
        ai = getGenAIClient();
      }

      // Determine model to use
      const modelToUse = selectedModel || 'gemini-2.5-flash';

      // Map history to the format required by the GoogleGenAI chats API or generate content
      const chatContents = [
        { role: 'user', parts: [{ text: `Abaixo está o histórico de nossa conversa e minha nova dúvida.\n\nHistórico:\n${history.map((h: any) => `${h.role === 'user' ? 'Usuário' : 'Consultor'}: ${h.text}`).join('\n')}\n\nNova Dúvida: ${message}` }] }
      ];

      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || 'Desculpe, não consegui obter uma resposta do assistente no momento.' });
    } else {
      // OpenAI, Nvidia or Custom OpenAI-compatible
      let apiKey = '';
      let apiBase = '';
      let modelToUse = '';

      if (provider === 'openai') {
        apiKey = (customOpenAiKey || '').trim();
        apiBase = 'https://api.openai.com/v1/chat/completions';
        modelToUse = selectedModel || 'gpt-4o-mini';
        if (!apiKey) {
          return res.status(400).json({ error: 'Chave de API da OpenAI não configurada. Por favor, adicione sua chave nas Configurações do painel do Finança AI.' });
        }
      } else if (provider === 'nvidia') {
        apiKey = (customNvidiaKey || '').trim();
        apiBase = 'https://integrate.api.nvidia.com/v1/chat/completions';
        modelToUse = selectedModel || 'meta/llama-3.1-70b-instruct';
        if (!apiKey) {
          return res.status(400).json({ error: 'Chave de API da NVIDIA não configurada. Por favor, adicione sua chave nas Configurações do painel do Finança AI.' });
        }
      } else if (provider === 'custom_openai') {
        apiKey = (customOpenAiKey || '').trim() || (customNvidiaKey || '').trim();
        apiBase = (customOpenAiBase || '').trim();
        modelToUse = (customOpenAiModel || '').trim() || 'custom-model';
        if (!apiBase) {
          return res.status(400).json({ error: 'Base URL personalizada não configurada nas Configurações.' });
        }
        // Normalize apiBase
        if (!apiBase.endsWith('/chat/completions')) {
          if (apiBase.endsWith('/')) {
            apiBase += 'chat/completions';
          } else if (apiBase.endsWith('/v1')) {
            apiBase += '/chat/completions';
          } else {
            apiBase += '/v1/chat/completions';
          }
        }
      }

      // Build chat messages
      const openAiMessages = [
        { role: 'system', content: systemInstruction }
      ];

      history.forEach((h: any) => {
        openAiMessages.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text
        });
      });

      openAiMessages.push({
        role: 'user',
        content: message
      });

      const response = await fetch(apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: openAiMessages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from OpenAI-compatible provider API:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (_) {}
        const detail = errorData?.error?.message || errorText || 'Erro desconhecido';
        return res.status(response.status).json({ error: `Erro do Provedor (${provider}): ${detail}` });
      }

      const responseData = await response.json() as any;
      const textResponse = responseData?.choices?.[0]?.message?.content || 'Não foi possível extrair a resposta do modelo.';
      res.json({ text: textResponse });
    }
  } catch (error: any) {
    console.error('Error with AI Chat API:', error);
    res.status(500).json({ error: error.message || 'Erro interno ao processar a resposta da IA.' });
  }
});

// ----------------- VITE / STATIC SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Finança AI Ultimate] Server running on http://localhost:${PORT}`);
  });
}

startServer();
