import { useState } from "react";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Competidor {
  id: number;
  nome: string;
  preco: string;
  promocao: string;
  entrega: string;
  satisfacao: string;
  redes: string;
  vantagem: string;
  isFeminnita: boolean;
}

interface Oportunidade {
  id: number;
  oportunidade: string;
  impacto: string;
  esforco: string;
  prazo: string;
  acao: string;
}

interface Ameaca {
  id: number;
  ameaca: string;
  impacto: string;
  probabilidade: "Alta" | "Média" | "Baixa";
  mitigacao: string;
}

export function AnalisesCompetitivaSection() {
  const [competidores, setCompetidores] = useState<Competidor[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [ameacas, setAmeacas] = useState<Ameaca[]>([]);

  const [novoComp, setNovoComp] = useState(false);
  const [formC, setFormC] = useState({ nome: '', preco: '', promocao: '', entrega: '', satisfacao: '', redes: '', vantagem: '', isFeminnita: false });

  const [novaOp, setNovaOp] = useState(false);
  const [formO, setFormO] = useState({ oportunidade: '', impacto: '', esforco: 'Médio', prazo: '', acao: '' });

  const [novaAm, setNovaAm] = useState(false);
  const [formA, setFormA] = useState({ ameaca: '', impacto: '', probabilidade: 'Alta' as Ameaca['probabilidade'], mitigacao: '' });

  const adicionarComp = () => {
    if (!formC.nome.trim()) { toast.error('Informe o nome.'); return; }
    const novo: Competidor = { id: Date.now(), ...formC };
    setCompetidores(prev => [...prev, novo]);
    setFormC({ nome: '', preco: '', promocao: '', entrega: '', satisfacao: '', redes: '', vantagem: '', isFeminnita: false });
    setNovoComp(false);
    toast.success('Competidor adicionado.');
  };

  const adicionarOp = () => {
    if (!formO.oportunidade.trim()) { toast.error('Informe a oportunidade.'); return; }
    const novo: Oportunidade = { id: Date.now(), ...formO };
    setOportunidades(prev => [...prev, novo]);
    setFormO({ oportunidade: '', impacto: '', esforco: 'Médio', prazo: '', acao: '' });
    setNovaOp(false);
    toast.success('Oportunidade registrada.');
  };

  const adicionarAm = () => {
    if (!formA.ameaca.trim()) { toast.error('Informe a ameaça.'); return; }
    const novo: Ameaca = { id: Date.now(), ...formA };
    setAmeacas(prev => [...prev, novo]);
    setFormA({ ameaca: '', impacto: '', probabilidade: 'Alta', mitigacao: '' });
    setNovaAm(false);
    toast.success('Ameaça registrada.');
  };

  const removerComp = (id: number) => setCompetidores(prev => prev.filter(c => c.id !== id));
  const removerOp = (id: number) => setOportunidades(prev => prev.filter(o => o.id !== id));
  const removerAm = (id: number) => setAmeacas(prev => prev.filter(a => a.id !== id));

  const feminnita = competidores.find(c => c.isFeminnita);
  const concorrentes = competidores.filter(c => !c.isFeminnita);

  return (
    <div className="space-y-6">
      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Análise baseada em dados inseridos manualmente</p>
              <p className="text-sm text-slate-600 mt-1">
                Cadastre os dados da Feminnita e dos concorrentes com base na sua pesquisa de mercado. Registre oportunidades e ameaças à medida que as identificar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação com Concorrentes */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Comparação com Concorrentes
            </CardTitle>
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setNovoComp(!novoComp)}>
              <Plus className="w-3 h-3" />
              Adicionar
            </Button>
          </div>
          <CardDescription>Cadastre seus dados e os dos concorrentes para comparação</CardDescription>
        </CardHeader>
        <CardContent>
          {novoComp && (
            <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Nome</label>
                    <input type="text" placeholder="Ex: Concorrente A" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.nome} onChange={e => setFormC(f => ({ ...f, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Preço Médio</label>
                    <input type="text" placeholder="Ex: R$ 125" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.preco} onChange={e => setFormC(f => ({ ...f, preco: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Promoções Típicas</label>
                    <input type="text" placeholder="Ex: 10-20%" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.promocao} onChange={e => setFormC(f => ({ ...f, promocao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Prazo de Entrega</label>
                    <input type="text" placeholder="Ex: 2-3 dias" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.entrega} onChange={e => setFormC(f => ({ ...f, entrega: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Satisfação do Cliente</label>
                    <input type="text" placeholder="Ex: 4.5/5" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.satisfacao} onChange={e => setFormC(f => ({ ...f, satisfacao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Canais de Venda</label>
                    <input type="text" placeholder="Ex: Instagram, TikTok" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.redes} onChange={e => setFormC(f => ({ ...f, redes: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold block mb-1">Principal Vantagem</label>
                    <input type="text" placeholder="Ex: Preço baixo / Marca consolidada" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.vantagem} onChange={e => setFormC(f => ({ ...f, vantagem: e.target.value }))} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" checked={formC.isFeminnita} onChange={e => setFormC(f => ({ ...f, isFeminnita: e.target.checked }))} />
                  <span className="text-sm font-semibold">Este é a Feminnita (seus próprios dados)</span>
                </label>
                <div className="flex gap-2">
                  <Button onClick={adicionarComp} className="flex-1 bg-blue-600 hover:bg-blue-700">Adicionar</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setNovoComp(false)}>Cancelar</Button>
                </div>
              </div>
            </Card>
          )}

          {competidores.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-slate-500 text-sm">Nenhum dado cadastrado ainda.</p>
              <p className="text-xs text-slate-400 mt-1">Adicione seus dados e os dos concorrentes para comparação.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feminnita && (
                <div className="border border-green-300 bg-green-50/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">{feminnita.nome}</h4>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-700">Você</Badge>
                      <Button size="sm" variant="ghost" className="text-red-600 h-6 w-6 p-0" onClick={() => removerComp(feminnita.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    {feminnita.preco && <div><p className="text-slate-500 text-xs">Preço</p><p className="font-bold">{feminnita.preco}</p></div>}
                    {feminnita.promocao && <div><p className="text-slate-500 text-xs">Promoção</p><p className="font-bold">{feminnita.promocao}</p></div>}
                    {feminnita.entrega && <div><p className="text-slate-500 text-xs">Entrega</p><p className="font-bold">{feminnita.entrega}</p></div>}
                    {feminnita.satisfacao && <div><p className="text-slate-500 text-xs">Satisfação</p><p className="font-bold text-blue-600">{feminnita.satisfacao}</p></div>}
                  </div>
                  {(feminnita.redes || feminnita.vantagem) && (
                    <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
                      {feminnita.redes && <div><p className="text-slate-500">Canais</p><p className="text-slate-700">{feminnita.redes}</p></div>}
                      {feminnita.vantagem && <div className="flex items-center justify-between"><p className="text-slate-500">Vantagem</p><p className="font-bold">{feminnita.vantagem}</p></div>}
                    </div>
                  )}
                </div>
              )}

              {concorrentes.map(comp => (
                <div key={comp.id} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">{comp.nome}</h4>
                    <Button size="sm" variant="ghost" className="text-red-600 h-6 w-6 p-0" onClick={() => removerComp(comp.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    {comp.preco && <div><p className="text-slate-500 text-xs">Preço</p><p className="font-bold">{comp.preco}</p></div>}
                    {comp.promocao && <div><p className="text-slate-500 text-xs">Promoção</p><p className="font-bold">{comp.promocao}</p></div>}
                    {comp.entrega && <div><p className="text-slate-500 text-xs">Entrega</p><p className="font-bold">{comp.entrega}</p></div>}
                    {comp.satisfacao && <div><p className="text-slate-500 text-xs">Satisfação</p><p className="font-bold text-blue-600">{comp.satisfacao}</p></div>}
                  </div>
                  {(comp.redes || comp.vantagem) && (
                    <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
                      {comp.redes && <div><p className="text-slate-500">Canais</p><p className="text-slate-700">{comp.redes}</p></div>}
                      {comp.vantagem && <div className="flex items-center justify-between"><p className="text-slate-500">Vantagem</p><p className="font-bold">{comp.vantagem}</p></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Oportunidades */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Oportunidades de Crescimento
            </CardTitle>
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setNovaOp(!novaOp)}>
              <Plus className="w-3 h-3" />
              Adicionar
            </Button>
          </div>
          <CardDescription>Registre oportunidades de mercado identificadas</CardDescription>
        </CardHeader>
        <CardContent>
          {novaOp && (
            <Card className="p-4 bg-white border-green-200 mb-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Oportunidade</label>
                  <input type="text" placeholder="Ex: Expandir para Marketplace" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formO.oportunidade} onChange={e => setFormO(f => ({ ...f, oportunidade: e.target.value }))} />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Impacto Estimado</label>
                    <input type="text" placeholder="Ex: Alto" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formO.impacto} onChange={e => setFormO(f => ({ ...f, impacto: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Esforço</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formO.esforco} onChange={e => setFormO(f => ({ ...f, esforco: e.target.value }))}>
                      <option>Baixo</option><option>Médio</option><option>Alto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Prazo</label>
                    <input type="text" placeholder="Ex: 30 dias" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formO.prazo} onChange={e => setFormO(f => ({ ...f, prazo: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Ação Necessária</label>
                  <input type="text" placeholder="Ex: Integrar com Amazon, Mercado Livre" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formO.acao} onChange={e => setFormO(f => ({ ...f, acao: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={adicionarOp} className="flex-1 bg-green-600 hover:bg-green-700">Registrar</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setNovaOp(false)}>Cancelar</Button>
                </div>
              </div>
            </Card>
          )}

          {oportunidades.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-green-300 rounded-lg">
              <p className="text-slate-500 text-sm">Nenhuma oportunidade registrada.</p>
              <p className="text-xs text-slate-400 mt-1">Registre oportunidades de mercado que identificar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {oportunidades.map(op => (
                <div key={op.id} className="border border-green-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{op.oportunidade}</h4>
                    <div className="flex gap-2 items-center">
                      {op.impacto && <Badge className="bg-green-100 text-green-700">{op.impacto}</Badge>}
                      <Button size="sm" variant="ghost" className="text-red-600 h-6 w-6 p-0" onClick={() => removerOp(op.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {op.esforco && <div><p className="text-slate-500 text-xs">Esforço</p><p className="font-bold">{op.esforco}</p></div>}
                    {op.prazo && <div><p className="text-slate-500 text-xs">Prazo</p><p className="font-bold">{op.prazo}</p></div>}
                    {op.acao && <div><p className="text-slate-500 text-xs">Ação</p><p className="font-bold text-blue-600 text-xs">{op.acao}</p></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ameaças */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Ameaças Competitivas
            </CardTitle>
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setNovaAm(!novaAm)}>
              <Plus className="w-3 h-3" />
              Adicionar
            </Button>
          </div>
          <CardDescription>Registre riscos competitivos a monitorar</CardDescription>
        </CardHeader>
        <CardContent>
          {novaAm && (
            <Card className="p-4 bg-white border-red-200 mb-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Ameaça</label>
                  <input type="text" placeholder="Ex: Concorrente lançando produto similar" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formA.ameaca} onChange={e => setFormA(f => ({ ...f, ameaca: e.target.value }))} />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Impacto</label>
                    <input type="text" placeholder="Ex: Reduzir market share" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formA.impacto} onChange={e => setFormA(f => ({ ...f, impacto: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Probabilidade</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formA.probabilidade} onChange={e => setFormA(f => ({ ...f, probabilidade: e.target.value as Ameaca['probabilidade'] }))}>
                      <option>Alta</option><option>Média</option><option>Baixa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Mitigação</label>
                  <input type="text" placeholder="Ex: Aumentar diferencial de valor" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formA.mitigacao} onChange={e => setFormA(f => ({ ...f, mitigacao: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={adicionarAm} className="flex-1 bg-red-600 hover:bg-red-700">Registrar</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setNovaAm(false)}>Cancelar</Button>
                </div>
              </div>
            </Card>
          )}

          {ameacas.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-red-200 rounded-lg">
              <p className="text-slate-500 text-sm">Nenhuma ameaça registrada.</p>
              <p className="text-xs text-slate-400 mt-1">Registre riscos competitivos que identificar no mercado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ameacas.map(ameaca => (
                <div key={ameaca.id} className="border border-red-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{ameaca.ameaca}</h4>
                    <div className="flex gap-2 items-center">
                      <Badge variant={ameaca.probabilidade === "Alta" ? "destructive" : "secondary"}>{ameaca.probabilidade}</Badge>
                      <Button size="sm" variant="ghost" className="text-red-600 h-6 w-6 p-0" onClick={() => removerAm(ameaca.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {ameaca.impacto && <div><p className="text-slate-500 text-xs">Impacto</p><p className="font-bold text-red-600">{ameaca.impacto}</p></div>}
                    {ameaca.mitigacao && <div><p className="text-slate-500 text-xs">Mitigação</p><p className="font-bold text-blue-600 text-xs">{ameaca.mitigacao}</p></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guia */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Como Usar a Análise Competitiva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-lg">1️⃣</span>
            <p><strong>Cadastre seus dados:</strong> Marque "Este é a Feminnita" para comparar seus números com os concorrentes</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">2️⃣</span>
            <p><strong>Pesquise concorrentes:</strong> Visite os perfis deles nas redes sociais e colete dados reais de preço, entrega e engajamento</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">3️⃣</span>
            <p><strong>Registre oportunidades:</strong> Áreas onde concorrentes são fracos ou onde você pode se diferenciar</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">4️⃣</span>
            <p><strong>Monitore ameaças:</strong> Mudanças de preço, novos produtos ou expansão dos concorrentes que podem te impactar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
