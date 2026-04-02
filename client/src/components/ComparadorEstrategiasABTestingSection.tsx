import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Zap, Target, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Versao {
  nome: string;
  descricao: string;
  conversoes: number;
  taxa_conversao: number;
}

interface TesteAB {
  id: string;
  nome: string;
  tipo: string;
  status: 'Em Andamento' | 'Concluído';
  dataInicio: string;
  vencedor: string | null;
  versoes: Versao[];
}

export function ComparadorEstrategiasABTestingSection() {
  const [testes, setTestes] = useState<TesteAB[]>([]);
  const [novoTeste, setNovoTeste] = useState(false);
  const [form, setForm] = useState({
    nome: '', tipo: 'copy',
    versoes: [{ nome: '', descricao: '' }, { nome: '', descricao: '' }],
    dataInicio: '',
  });

  const adicionarVersao = () => {
    if (form.versoes.length >= 4) return;
    setForm(f => ({ ...f, versoes: [...f.versoes, { nome: '', descricao: '' }] }));
  };

  const removerVersao = (idx: number) => {
    if (form.versoes.length <= 2) return;
    setForm(f => ({ ...f, versoes: f.versoes.filter((_, i) => i !== idx) }));
  };

  const atualizarVersaoForm = (idx: number, campo: 'nome' | 'descricao', valor: string) => {
    setForm(f => {
      const versoes = [...f.versoes];
      versoes[idx] = { ...versoes[idx], [campo]: valor };
      return { ...f, versoes };
    });
  };

  const criarTeste = () => {
    if (!form.nome.trim()) { toast.error('Informe o nome do teste.'); return; }
    if (form.versoes.some(v => !v.nome.trim())) { toast.error('Preencha o nome de todas as versões.'); return; }

    const novo: TesteAB = {
      id: String(Date.now()),
      nome: form.nome,
      tipo: form.tipo,
      status: 'Em Andamento',
      dataInicio: form.dataInicio || new Date().toISOString().split('T')[0],
      vencedor: null,
      versoes: form.versoes.map(v => ({
        nome: v.nome,
        descricao: v.descricao,
        conversoes: 0,
        taxa_conversao: 0,
      })),
    };
    setTestes(prev => [...prev, novo]);
    setForm({ nome: '', tipo: 'copy', versoes: [{ nome: '', descricao: '' }, { nome: '', descricao: '' }], dataInicio: '' });
    setNovoTeste(false);
    toast.success('Teste criado! Publique as variações e registre os resultados aqui.');
  };

  const atualizarMetrica = (testeId: string, versaoIdx: number, campo: 'conversoes' | 'taxa_conversao', valor: number) => {
    setTestes(prev => prev.map(t => {
      if (t.id !== testeId) return t;
      const versoes = [...t.versoes];
      versoes[versaoIdx] = { ...versoes[versaoIdx], [campo]: valor };
      return { ...t, versoes };
    }));
  };

  const concluirTeste = (testeId: string) => {
    setTestes(prev => prev.map(t => {
      if (t.id !== testeId) return t;
      const melhor = t.versoes.reduce((best, v, idx) =>
        v.taxa_conversao > (t.versoes[best]?.taxa_conversao ?? -1) ? idx : best, 0);
      return { ...t, status: 'Concluído', vencedor: t.versoes[melhor].nome };
    }));
  };

  const emAndamento = testes.filter(t => t.status === 'Em Andamento').length;
  const concluidos = testes.filter(t => t.status === 'Concluído').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Comparador de Estratégias (A/B Testing)</h2>
          <p className="text-slate-600 mt-1">Teste diferentes abordagens para maximizar ROI</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
          {testes.length} Testes
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Testes Totais</p>
          <p className="text-2xl font-bold text-slate-900">{testes.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Em Andamento</p>
          <p className="text-2xl font-bold text-blue-600">{emAndamento}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Concluídos</p>
          <p className="text-2xl font-bold text-green-600">{concluidos}</p>
        </div>
      </div>

      {/* Botão criar */}
      <Button
        onClick={() => setNovoTeste(!novoTeste)}
        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
        size="lg"
      >
        <Zap className="w-5 h-5" />
        Criar Novo A/B Test
      </Button>

      {/* Formulário */}
      {novoTeste && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Novo Teste de Estratégias</CardTitle>
            <CardDescription>Configure as variações que deseja comparar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Nome do Teste</label>
                <input
                  type="text"
                  placeholder="Ex: Pijama Carol - Copy Test"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Tipo</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                >
                  <option value="copy">Copy (texto)</option>
                  <option value="imagem">Imagem</option>
                  <option value="preco">Preço</option>
                  <option value="horario">Horário</option>
                  <option value="formato">Formato</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Data de Início</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded"
                value={form.dataInicio}
                onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Versões ({form.versoes.length})</label>
                {form.versoes.length < 4 && (
                  <Button size="sm" variant="outline" onClick={adicionarVersao}>+ Adicionar Versão</Button>
                )}
              </div>
              {form.versoes.map((v, idx) => (
                <div key={idx} className="grid md:grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Versão {String.fromCharCode(65 + idx)} — Nome</label>
                    <input
                      type="text"
                      placeholder={`Ex: Versão ${String.fromCharCode(65 + idx)} (Qualidade)`}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      value={v.nome}
                      onChange={e => atualizarVersaoForm(idx, 'nome', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Descrição / Gancho</label>
                      <input
                        type="text"
                        placeholder="Ex: Pijama Premium - Tecido Egípcio"
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        value={v.descricao}
                        onChange={e => atualizarVersaoForm(idx, 'descricao', e.target.value)}
                      />
                    </div>
                    {idx >= 2 && (
                      <Button size="sm" variant="outline" className="self-end text-red-600" onClick={() => removerVersao(idx)}>✕</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={criarTeste} className="flex-1 bg-green-600 hover:bg-green-700">Criar Teste</Button>
              <Button variant="outline" className="flex-1" onClick={() => setNovoTeste(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de testes */}
      {testes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhum teste criado ainda.</p>
            <p className="text-sm text-slate-400 mt-1">Crie um teste acima, publique as variações e registre os resultados para comparar estratégias.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {testes.map((teste) => (
            <Card key={teste.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      {teste.nome}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {teste.tipo} • {teste.dataInicio} • {teste.versoes.length} versões
                    </CardDescription>
                  </div>
                  <Badge className={teste.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {teste.status === 'Concluído' ? '✅ Concluído' : '🔄 Em Andamento'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {teste.versoes.map((versao, idx) => {
                  const isWinner = teste.status === 'Concluído' && teste.vencedor === versao.nome;
                  const melhorTaxa = Math.max(...teste.versoes.map(v => v.taxa_conversao));
                  const ehMelhorAtual = versao.taxa_conversao === melhorTaxa && melhorTaxa > 0;

                  return (
                    <div key={idx} className={`p-4 border-2 rounded-lg ${isWinner ? 'border-green-300 bg-green-50' : ehMelhorAtual && teste.status === 'Em Andamento' ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            {versao.nome}
                            {isWinner && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                          {versao.descricao && <div className="text-sm text-slate-600 mt-0.5">{versao.descricao}</div>}
                        </div>
                        {isWinner && <Badge className="bg-green-600 text-white">🏆 Vencedor</Badge>}
                      </div>

                      {teste.status === 'Em Andamento' ? (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-500">Conversões reais</label>
                            <input
                              type="number" min="0"
                              className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                              value={versao.conversoes}
                              onChange={e => atualizarMetrica(teste.id, idx, 'conversoes', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">Taxa de conversão (%)</label>
                            <input
                              type="number" min="0" step="0.01"
                              className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                              value={versao.taxa_conversao}
                              onChange={e => atualizarMetrica(teste.id, idx, 'taxa_conversao', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Conversões</span>
                            <span className="font-bold">{versao.conversoes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Taxa Conversão</span>
                            <span className={`font-bold ${isWinner ? 'text-green-600' : 'text-slate-900'}`}>{versao.taxa_conversao}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {teste.status === 'Em Andamento' && (
                  <Button onClick={() => concluirTeste(teste.id)} className="w-full bg-green-600 hover:bg-green-700 gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Concluir Teste e Declarar Vencedor
                  </Button>
                )}

                {teste.status === 'Concluído' && teste.vencedor && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <p className="text-green-800 font-medium">✅ {teste.vencedor} venceu.</p>
                    <p className="text-slate-600 mt-1">Recomendação: Use esta versão em 100% das campanhas do mesmo tipo.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Como Funciona */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BarChart3 className="w-5 h-5" />
            Como Funciona A/B Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { n: 1, titulo: 'Crie 2-4 Versões', sub: 'Mude uma coisa: copy, imagem, preço, horário' },
              { n: 2, titulo: 'Divida o Tráfego', sub: 'Cada versão recebe parte igual do tráfego' },
              { n: 3, titulo: 'Registre os Resultados', sub: 'Insira conversões e taxa de conversão reais' },
              { n: 4, titulo: 'Escolha o Vencedor', sub: 'Use a versão com maior taxa em 100% das campanhas' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{item.n}</div>
                <div>
                  <div className="font-medium text-slate-900">{item.titulo}</div>
                  <div className="text-sm text-slate-600">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
