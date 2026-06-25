import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { Database, Shield, Lock, Upload, Download, RefreshCw, Key, FileCode, Check, AlertCircle } from 'lucide-react';

export const BackupSecurityView: React.FC = () => {
  const {
    security,
    updateSecurity,
    exportBackup,
    importBackup,
    accounts,
    addTransaction,
  } = useFinance();

  const [pinInput, setPinInput] = useState('');
  const [enablePin, setEnablePin] = useState(security.pinEnabled);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OFX Parser State
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [ofxTransactionsCount, setOfxTransactionsCount] = useState<number | null>(null);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4 || isNaN(Number(pinInput))) {
      alert('O PIN de segurança deve conter exatamente 4 dígitos numéricos.');
      return;
    }
    updateSecurity({
      pinEnabled: enablePin,
      pinCode: pinInput,
    });
    setSuccessMsg('Configurações de PIN de segurança atualizadas com sucesso!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleExportBackup = () => {
    const dataStr = exportBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Financa_AI_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);
        const success = importBackup(parsed);
        if (success) {
          alert('Backup importado com sucesso! O aplicativo será recarregado.');
          window.location.reload();
        } else {
          alert('Estrutura de arquivo de backup inválida ou corrompida.');
        }
      } catch (err) {
        alert('Falha ao processar o arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
  };

  // Real API Cloud Save
  const handleCloudSave = async () => {
    setSyncStatus('syncing');
    setErrorMsg(null);
    try {
      const payload = exportBackup();
      const response = await fetch('/api/backup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'igor_default_user', backupData: JSON.parse(payload) }),
      });

      if (response.ok) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setErrorMsg('Erro ao salvar dados no banco do servidor.');
      }
    } catch (e) {
      setSyncStatus('error');
      setErrorMsg('Falha de conexão com a API de backup.');
    }
  };

  // Real API Cloud Load
  const handleCloudLoad = async () => {
    if (!confirm('Carregar o backup do servidor irá substituir seus dados locais atuais. Deseja prosseguir?')) return;
    setSyncStatus('syncing');
    setErrorMsg(null);
    try {
      const response = await fetch('/api/backup/load?userId=igor_default_user');
      if (response.ok) {
        const data = await response.json();
        if (data && data.backupData) {
          importBackup(data.backupData);
          setSyncStatus('success');
          alert('Backup sincronizado em nuvem carregado com sucesso!');
          window.location.reload();
        } else {
          setSyncStatus('error');
          setErrorMsg('Nenhum backup em nuvem encontrado para este usuário.');
        }
      } else {
        setSyncStatus('error');
        setErrorMsg('Erro ao recuperar backup remoto.');
      }
    } catch (e) {
      setSyncStatus('error');
      setErrorMsg('Erro de conexão ao baixar backup.');
    }
  };

  // Real OFX Bank Statement parsing
  const handleOfxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedAccountId) {
      alert('Selecione uma conta bancária para receber os lançamentos do extrato.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        // Regex to match <STMTTRN> transaction blocks in standard OFX files
        const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
        let match;
        let count = 0;

        while ((match = trnRegex.exec(text)) !== null) {
          const block = match[1];

          // Parse description (<MEMO> or <NAME>)
          const memoMatch = /<MEMO>(.*)/.exec(block) || /<NAME>(.*)/.exec(block);
          // Parse amount (<TRNAMT>)
          const amtMatch = /<TRNAMT>(.*)/.exec(block);
          // Parse date (<DTPOSTED>)
          const dateMatch = /<DTPOSTED>(.*)/.exec(block);

          if (memoMatch && amtMatch && dateMatch) {
            const desc = memoMatch[1].trim();
            const rawAmt = parseFloat(amtMatch[1].trim().replace(',', '.'));
            
            // Format OFX date (YYYYMMDD...) to standard YYYY-MM-DD
            const rawDate = dateMatch[1].trim();
            const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;

            addTransaction({
              description: desc,
              amount: rawAmt,
              type: rawAmt > 0 ? 'income' : 'expense',
              date: formattedDate,
              category: 'Outros',
              accountId: selectedAccountId,
            });
            count++;
          }
        }

        if (count > 0) {
          setOfxTransactionsCount(count);
          setTimeout(() => setOfxTransactionsCount(null), 5000);
        } else {
          alert('Não foi encontrada nenhuma transação compatível no arquivo OFX enviado.');
        }
      } catch (err) {
        alert('Erro ao processar o formato do arquivo OFX.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div>
        <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Segurança e Dados</span>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Configurações & Backup</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie a segurança da sua conta com PIN de bloqueio e importe/exporte backups locais ou em nuvem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sync & Backup Column */}
        <div className="space-y-6">
          {/* Cloud Synchronizer */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="text-blue-600" size={18} />
              Sincronização em Nuvem (Durable Sync)
            </h3>
            <p className="text-xs text-slate-500">
              Sincronize com segurança seu estado financeiro no servidor central do Finança AI para poder acessar em outros navegadores ou computadores.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCloudSave}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
                id="btn-cloud-save"
              >
                <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                <span>Salvar na Nuvem</span>
              </button>
              <button
                onClick={handleCloudLoad}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-750 hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
                id="btn-cloud-load"
              >
                <Download size={14} />
                <span>Restaurar da Nuvem</span>
              </button>
            </div>

            {syncStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <Check size={14} />
                <span>Dados sincronizados com sucesso no servidor!</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Local Backup JSON */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="text-blue-600" size={18} />
              Exportar & Importar Arquivo Local
            </h3>
            <p className="text-xs text-slate-500">
              Faça o download de uma cópia física completa (.json) de seus dados no seu computador ou faça a importação de uma cópia prévia.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-750 hover:bg-slate-50 transition-all shadow-sm"
                id="btn-export-backup"
              >
                <Download size={14} />
                <span>Exportar JSON de Backup</span>
              </button>

              <label className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-750 hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
                <Upload size={14} />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Security & Statement Column */}
        <div className="space-y-6">
          {/* OFX Importer */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="text-blue-600" size={18} />
              Importar Extrato Bancário (.OFX)
            </h3>
            <p className="text-xs text-slate-500">
              Carregue extratos de bancos tradicionais (Itaú, Bradesco, BB, Inter, etc.) e importe os lançamentos passados automaticamente sem precisar digitar.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-semibold block">Selecione a conta destino dos lançamentos</label>
                <select
                  required
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione a conta...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer shadow-sm">
                <Upload size={14} />
                <span>Selecionar Arquivo OFX</span>
                <input
                  type="file"
                  accept=".ofx"
                  disabled={!selectedAccountId}
                  onChange={handleOfxUpload}
                  className="hidden"
                />
              </label>

              {ofxTransactionsCount !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <Check size={14} />
                  <span>Sucesso! Importadas {ofxTransactionsCount} transações do extrato bancário.</span>
                </div>
              )}
            </div>
          </div>

          {/* Lock Screen PIN Configuration */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="text-blue-600" size={18} />
              Bloqueio por PIN de Segurança
            </h3>
            <p className="text-xs text-slate-500">
              Defina um código numérico de 4 dígitos para proteger o acesso visual de suas finanças ao carregar o aplicativo.
            </p>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cb-require-pin"
                  checked={enablePin}
                  onChange={e => setEnablePin(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="cb-require-pin" className="text-xs text-slate-600 cursor-pointer">
                  Exigir PIN de segurança ao abrir o aplicativo
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-semibold block">Senha PIN (4 dígitos numéricos)</label>
                <input
                  type="password"
                  maxLength={4}
                  required={enablePin}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-center text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="****"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm"
              >
                Salvar Configurações de Acesso
              </button>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <Check size={14} />
                  <span>{successMsg}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
