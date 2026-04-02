import { TrendingUp, AlertCircle, Target, BarChart3, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ConcorrenteMonitorado {
  id: number;
  nome: string;
  site: string;
  precoMedio: string;
  seuPreco: string;
  engajamento: string;
  estrategia: string;
}

interface AlertaCompetitivo {
  id: number;
  concorrente: string;
  descricao: string;
  impacto: "Alto" | "Médio" | "Baixo";
  acao: string;
  data: string;
}

interface OportunidadeGap {
  id: number;
  oportunidade: string;
  acao: string;
  prazo: string;
  impacto: "Alto" | "Médio" | "Baixo";
}

export function AnaliseConcorrenciaTempoRealSection() {
  const [concorrentes, setConcorrentes] = useState<ConcorrenteMonitorado[]>([]);
  const [alertas, setAlertas] = useState<AlertaCompetitivo[]>([]);
  const [oportunidades, setOportunidades] = useState<OportunidadeGap[]>([]);

  const [formConc, setFormConc] = useState({ nome: '', site: '', precoMedio: '', seuPreco: '', engajamento: '', estrategia: '' });
  const [formAlerta, setFormAlerta] = useState({ concorrente: '', descricao: '', impacto: 'Alto' as "Alto" | "Médio" | "Baixo", acao: '', data: '' });
  const [formOp, setFormOp] = useState({ oportunidade: '', acao: '', prazo: '', impacto: 'Alto' as "Alto" | "Médio" | "Baixo" });

  const [mostrarFormConc, setMostrarFormConc] = useState(false);
  const [mostrarFormAlerta, setMostrarFormAlerta] = useState(false);
  const [mostrarFormOp, setMostrarFormOp] = useState(false);

  const adicionarConcorrente = () => {
    if (!formConc.nome.trim()) { toast.error('Informe o nome do concorrente.'); return; }
    setConcorrentes(prev => [...prev, { id: Date.now(), ...formConc }]);
    setFormConc({ nome: '', site: '', precoMedio: '', seuPreco: '', engajamento: '', estrategia: '' });
    setMostrarFormConc(false);
    toast.success('Concorrente adicionado ao monitoramento.');
  };

  const adicionarAlerta = () => {
    if (!formAlerta.descricao.trim()) { toast.error('Descreva o alerta.'); return; }
    setAlertas(prev => [{ id: Date.now(), ...formAlerta, data: formAlerta.data || new Date().toLocaleDateString('pt-BR') }, ...prev]);
    setFormAlerta({ concorrente: '', descricao: '', impacto: 'Alto', acao: '', data: '' });
    setMostrarFormAlerta(false);
    toast.success('Alerta registrado.');
  };

  const adicionarOportunidade = () => {
    if (!formOp.oportunidade.trim()) { toast.error('Descreva a oportunidade.'); return; }
    setOportunidades(prev => [...prev, { id: Date.now(), ...formOp }]);
    setFormOp({ oportunidade: '', acao: '', prazo: '', impacto: 'Alto' });
    setMostrarFormOp(false);
    toast.success('Oportunidade registrada.');
  };

  const impactoBadge = (impacto: "Alto" | "Médio" | "Baixo") => {
    const cls = impacto === "Alto" ? "bg-red-100 text-red-700" : impacto === "Médio" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
    return <Badge className={cls}>{impacto}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Monitoramento automático requer integração com APIs externas</p>
              <p className="text-sm text-slate-600 mt-1">
                Para rastrear preços, promoções e posts de concorrentes em tempo real, configure integrações com SimilarWeb, SEMrush ou a API do Instagram. Por enquanto, registre manualmente os dados coletados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contadores reais */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Monitorados</p>
          <p className="text-2xl font-bold text-blue-600">{concorrentes.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Alertas</p>
          <p className="text-2xl font-bold text-red-600">{alertas.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Oportunidades</p>
          <p className="text-2xl font-bold text-green-600">{oportunidades.length}</p>
        </div>
      </div>

      {/* Concorrentes Monitorados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Concorrentes Monitorados
              </CardTitle>
              <CardDescription>Adicione concorrentes com seus dados reais coletados manualmente</CardDescription>
            </div>
            <Button size="sm" onClick={() => setMostrarFormConc(!mostrarFormConc)} className="gap-1">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostrarFormConc && (
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome</label>
                  <input type="text" placeholder="Ex: Lua Chic Pijamas" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formConc.nome} onChange={e => setFormConc(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Site / @Instagram</label>
                  <input type="text" placeholder="@luachicpijamas" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formConc.site} onChange={e => setFormConc(f => ({ ...f, site: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Preço Médio Deles</label>
                  <input type="text" placeholder="R$ 185" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formConc.precoMedio} onChange={e => setFormConc(f => ({ ...f, precoMedio: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Seu Preço Equivalente</label>
                  <input type="text" placeholder="R$ 125" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formConc.seuPreco} onChange={e => setFormConc(f => ({ ...f, seuPreco: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Engajamento Deles</label>
                  <input type="text" placeholder="8.5%" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formConc.engajamento} onChange={e => setFormConc(f => ({ ...f, engajamento: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Estratégia Principal</label>
                  <input type="text" placeholder="Ex: Influenciadores Premium" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formConc.estrategia} onChange={e => setFormConc(f => ({ ...f, estrategia: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarConcorrente} className="bg-green-600 hover:bg-green-700">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setMostrarFormConc(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {concorrentes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Nenhum concorrente monitorado. Clique em "+ Adicionar" para começar.</p>
          ) : (
            concorrentes.map((conc) => (
              <div key={conc.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{conc.nome}</h4>
                  {conc.site && <span className="text-xs text-slate-500">{conc.site}</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {conc.precoMedio && <div><p className="text-slate-500 text-xs">Preço Deles</p><p className="font-bold text-slate-900">{conc.precoMedio}</p></div>}
                  {conc.seuPreco && <div><p className="text-slate-500 text-xs">Seu Preço</p><p className="font-bold text-green-600">{conc.seuPreco}</p></div>}
                  {conc.engajamento && <div><p className="text-slate-500 text-xs">Engajamento</p><p className="font-bold">{conc.engajamento}</p></div>}
                  {conc.estrategia && <div><p className="text-slate-500 text-xs">Estratégia</p><p className="font-bold text-xs">{conc.estrategia}</p></div>}
                </div>
                <Button size="sm" variant="outline" className="mt-2 text-red-600 text-xs" onClick={() => setConcorrentes(p => p.filter(c => c.id !== conc.id))}>Remover</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Alertas Competitivos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Alertas Competitivos
              </CardTitle>
              <CardDescription>Ações dos concorrentes que requerem resposta</CardDescription>
            </div>
            <Button size="sm" onClick={() => setMostrarFormAlerta(!mostrarFormAlerta)} className="gap-1">
              <Plus className="w-4 h-4" /> Registrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostrarFormAlerta && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Concorrente</label>
                  <input type="text" placeholder="Ex: Concorrente A" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formAlerta.concorrente} onChange={e => setFormAlerta(f => ({ ...f, concorrente: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Impacto</label>
                  <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formAlerta.impacto} onChange={e => setFormAlerta(f => ({ ...f, impacto: e.target.value as "Alto" | "Médio" | "Baixo" }))}>
                    <option>Alto</option><option>Médio</option><option>Baixo</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Descrição do Alerta</label>
                  <input type="text" placeholder="Ex: Lançou nova linha com preço 20% menor" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formAlerta.descricao} onChange={e => setFormAlerta(f => ({ ...f, descricao: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Ação Recomendada</label>
                  <input type="text" placeholder="Ex: Criar promoção similar" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formAlerta.acao} onChange={e => setFormAlerta(f => ({ ...f, acao: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Data</label>
                  <input type="date" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formAlerta.data} onChange={e => setFormAlerta(f => ({ ...f, data: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarAlerta} className="bg-green-600 hover:bg-green-700">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setMostrarFormAlerta(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {alertas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Nenhum alerta registrado. Monitore concorrentes e registre movimentos relevantes.</p>
          ) : (
            alertas.map((alerta) => (
              <div key={alerta.id} className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {alerta.concorrente && <span className="text-xs font-semibold text-slate-600">{alerta.concorrente} · </span>}
                    <span className="text-xs text-slate-500">{alerta.data}</span>
                    <h4 className="font-semibold text-slate-900 mt-1">{alerta.descricao}</h4>
                  </div>
                  {impactoBadge(alerta.impacto)}
                </div>
                {alerta.acao && <p className="text-xs text-blue-700 font-semibold mt-1">Ação: {alerta.acao}</p>}
                <Button size="sm" variant="outline" className="mt-2 text-red-600 text-xs" onClick={() => setAlertas(p => p.filter(a => a.id !== alerta.id))}>Remover</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Oportunidades de Gap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Oportunidades de Gap
              </CardTitle>
              <CardDescription>O que concorrentes não fazem e você pode explorar</CardDescription>
            </div>
            <Button size="sm" onClick={() => setMostrarFormOp(!mostrarFormOp)} className="gap-1">
              <Plus className="w-4 h-4" /> Registrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostrarFormOp && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Oportunidade Identificada</label>
                  <input type="text" placeholder="Ex: Concorrente A não tem WhatsApp para atendimento" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formOp.oportunidade} onChange={e => setFormOp(f => ({ ...f, oportunidade: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Ação a Tomar</label>
                  <input type="text" placeholder="Ex: Implementar WhatsApp Business" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formOp.acao} onChange={e => setFormOp(f => ({ ...f, acao: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Prazo</label>
                  <input type="text" placeholder="Ex: 2 semanas" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formOp.prazo} onChange={e => setFormOp(f => ({ ...f, prazo: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Impacto</label>
                  <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formOp.impacto} onChange={e => setFormOp(f => ({ ...f, impacto: e.target.value as "Alto" | "Médio" | "Baixo" }))}>
                    <option>Alto</option><option>Médio</option><option>Baixo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarOportunidade} className="bg-green-600 hover:bg-green-700">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setMostrarFormOp(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {oportunidades.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Nenhuma oportunidade registrada. Identifique gaps nos concorrentes e registre aqui.</p>
          ) : (
            oportunidades.map((op) => (
              <div key={op.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{op.oportunidade}</h4>
                  {impactoBadge(op.impacto)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {op.acao && <div><p className="text-slate-500 text-xs">Ação</p><p className="font-semibold text-blue-600 text-xs">{op.acao}</p></div>}
                  {op.prazo && <div><p className="text-slate-500 text-xs">Prazo</p><p className="font-semibold">{op.prazo}</p></div>}
                </div>
                <Button size="sm" variant="outline" className="mt-2 text-red-600 text-xs" onClick={() => setOportunidades(p => p.filter(o => o.id !== op.id))}>Remover</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Guia estratégico */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Guia de Monitoramento Competitivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Monitore preços semanalmente e responda em 24-48h quando necessário",
            "Acompanhe promoções dos concorrentes para não perder oportunidades",
            "Analise estratégia de conteúdo deles para identificar gaps",
            "Use Instagram Insights e SimilarWeb para métricas de engajamento",
            "Foque em diferenciais únicos (personas, preço, atendimento)",
            "Registre oportunidades que concorrentes ignoram e execute primeiro",
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">✅ {dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
