import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Users, Video, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Venda {
  id: number;
  cliente: string;
  valor: number;
  data: string;
  persona: string;
  roteiro: string;
  campanha: string;
  plataforma: string;
}

const PERSONAS = ["Carol (Renda Extra)", "Renata (Lojista)", "Vanessa (Compra Coletiva)", "Luiza (Trendsetter)"];
const PLATAFORMAS = ["Instagram", "Facebook", "TikTok", "Google", "WhatsApp", "Email", "Orgânico"];

export default function AtribuicaoVendasSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [novaVenda, setNovaVenda] = useState(false);
  const [form, setForm] = useState({
    cliente: '', valor: '', data: '', persona: PERSONAS[0],
    roteiro: '', campanha: '', plataforma: PLATAFORMAS[0],
  });

  const registrarVenda = () => {
    if (!form.cliente.trim() || !form.valor) {
      toast.error('Preencha nome do cliente e valor.');
      return;
    }
    const nova: Venda = {
      id: Date.now(),
      cliente: form.cliente,
      valor: parseFloat(form.valor),
      data: form.data || new Date().toLocaleString('pt-BR'),
      persona: form.persona,
      roteiro: form.roteiro,
      campanha: form.campanha,
      plataforma: form.plataforma,
    };
    setVendas(prev => [nova, ...prev]);
    setForm({ cliente: '', valor: '', data: '', persona: PERSONAS[0], roteiro: '', campanha: '', plataforma: PLATAFORMAS[0] });
    setNovaVenda(false);
    toast.success('Venda registrada com atribuição completa.');
  };

  const removerVenda = (id: number) => {
    setVendas(prev => prev.filter(v => v.id !== id));
  };

  const totalVendas = vendas.length;
  const totalReceita = vendas.reduce((a, v) => a + v.valor, 0);
  const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0;

  // Atribuição por persona (calculada das vendas registradas)
  const porPersona = PERSONAS.map(persona => {
    const vendasPersona = vendas.filter(v => v.persona === persona);
    const receita = vendasPersona.reduce((a, v) => a + v.valor, 0);
    return { persona, vendas: vendasPersona.length, receita };
  }).filter(p => p.vendas > 0).sort((a, b) => b.receita - a.receita);

  // Atribuição por campanha (campanhas do banco + vendas manuais)
  const campanhasAtivas = (campanhas as any[]).filter(c => c.status === 'ativa');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Atribuição de Vendas</h2>
        <p className="text-slate-600">
          Rastreie qual persona/roteiro/campanha gerou cada venda para otimizar orçamento e identificar melhor ROI.
        </p>
      </div>

      {/* Aviso integração */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Atribuição automática requer integração com e-commerce</p>
              <p className="text-sm text-slate-600 mt-1">
                Para atribuição automática de pedidos, conecte o Bling ERP. Enquanto isso, registre vendas manualmente abaixo para rastrear atribuição por persona, roteiro e canal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total Vendas</p>
          <p className="text-2xl font-bold text-blue-600">{totalVendas}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Receita Total</p>
          <p className="text-2xl font-bold text-green-600">
            {totalReceita > 0 ? `R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold text-orange-600">
            {ticketMedio > 0 ? `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
          </p>
        </div>
      </div>

      {/* Botão registrar */}
      <Button onClick={() => setNovaVenda(!novaVenda)} className="w-full bg-purple-600 hover:bg-purple-700 gap-2" size="lg">
        <Plus className="w-5 h-5" />
        Registrar Nova Venda
      </Button>

      {/* Formulário */}
      {novaVenda && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Nova Venda com Atribuição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Cliente</label>
                <input
                  type="text" placeholder="Nome do cliente"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.cliente}
                  onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Valor (R$)</label>
                <input
                  type="number" min="0" step="0.01" placeholder="0,00"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.valor}
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Persona</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.persona}
                  onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}
                >
                  {PERSONAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Plataforma</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.plataforma}
                  onChange={e => setForm(f => ({ ...f, plataforma: e.target.value }))}
                >
                  {PLATAFORMAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Roteiro / Conteúdo</label>
                <input
                  type="text" placeholder="Ex: Análise de Qualidade"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.roteiro}
                  onChange={e => setForm(f => ({ ...f, roteiro: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Campanha</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.campanha}
                  onChange={e => setForm(f => ({ ...f, campanha: e.target.value }))}
                >
                  <option value="">— Selecione —</option>
                  {campanhasAtivas.map((c: any) => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                  <option value="Orgânico">Orgânico (sem campanha)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={registrarVenda} className="flex-1 bg-green-600 hover:bg-green-700">Registrar Venda</Button>
              <Button variant="outline" className="flex-1" onClick={() => setNovaVenda(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de vendas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vendas Rastreadas</CardTitle>
          <CardDescription>Cada venda com atribuição completa</CardDescription>
        </CardHeader>
        <CardContent>
          {vendas.length === 0 ? (
            <div className="py-10 text-center">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Nenhuma venda registrada ainda.</p>
              <p className="text-sm text-slate-400 mt-1">Use o botão acima para registrar vendas com atribuição por persona, roteiro e canal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vendas.map((venda) => (
                <div key={venda.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{venda.cliente}</h4>
                      <p className="text-xs text-slate-600">{venda.data}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-green-600">R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={() => removerVenda(venda.id)}>✕</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div><p className="text-slate-500">Persona</p><p className="font-semibold text-slate-900">{venda.persona}</p></div>
                    <div><p className="text-slate-500">Plataforma</p><p className="font-semibold text-slate-900">{venda.plataforma}</p></div>
                    {venda.roteiro && <div><p className="text-slate-500">Roteiro</p><p className="font-semibold text-slate-900">{venda.roteiro}</p></div>}
                    {venda.campanha && <div><p className="text-slate-500">Campanha</p><p className="font-semibold text-slate-900">{venda.campanha}</p></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atribuição por Persona */}
      {porPersona.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Atribuição por Persona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {porPersona.map((attr) => {
              const pct = totalReceita > 0 ? (attr.receita / totalReceita) * 100 : 0;
              return (
                <div key={attr.persona} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{attr.persona}</h4>
                      <p className="text-xs text-slate-600">{attr.vendas} vendas • R$ {attr.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <Badge className="bg-blue-600">{pct.toFixed(1)}%</Badge>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Campanhas ativas do banco */}
      {campanhasAtivas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Campanhas Ativas (dados reais)
            </CardTitle>
            <CardDescription>Conversões registradas nas campanhas cadastradas</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold">Campanha</th>
                  <th className="text-left py-2 px-2 font-semibold">Plataforma</th>
                  <th className="text-right py-2 px-2 font-semibold">Conversões</th>
                  <th className="text-right py-2 px-2 font-semibold">ROI</th>
                </tr>
              </thead>
              <tbody>
                {campanhasAtivas.map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium">{c.nome}</td>
                    <td className="py-2 px-2 capitalize">{c.plataforma}</td>
                    <td className="py-2 px-2 text-right font-semibold text-green-600">{c.conversoes ?? 0}</td>
                    <td className="py-2 px-2 text-right font-semibold text-purple-600">
                      {c.roi ? `${parseFloat(c.roi).toFixed(0)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Maximizar ROI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Rastreie cada venda até sua origem (persona/roteiro/campanha)",
            "Calcule ROI por persona para identificar melhor público",
            "Aumente budget em roteiros com melhor performance",
            "Compare CPA entre personas para otimizar gastos",
            "Monitore atribuição semanalmente",
            "Conecte Bling ERP para atribuição automática por pedido",
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">✅ {dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
