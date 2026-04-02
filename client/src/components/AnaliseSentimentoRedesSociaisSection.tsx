import { Heart, TrendingUp, AlertCircle, MessageCircle, Zap, CheckCircle, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface MencaoManual {
  id: number;
  rede: string;
  descricao: string;
  tipo: "Positivo" | "Neutro" | "Negativo";
  acao: string;
  data: string;
}

interface Influenciador {
  id: number;
  nome: string;
  rede: string;
  seguidores: string;
  engajamento: string;
  mencoes: string;
  acao: string;
}

interface TendenciaManual {
  id: number;
  titulo: string;
  rede: string;
  crescimento: string;
  recomendacao: string;
}

const REDES = ["Instagram", "TikTok", "Facebook", "YouTube", "Pinterest", "Twitter/X", "WhatsApp"];

export function AnaliseSentimentoRedesSociaisSection() {
  const [mencoes, setMencoes] = useState<MencaoManual[]>([]);
  const [influenciadores, setInfluenciadores] = useState<Influenciador[]>([]);
  const [tendencias, setTendencias] = useState<TendenciaManual[]>([]);

  const [formMencao, setFormMencao] = useState({ rede: 'Instagram', descricao: '', tipo: 'Positivo' as "Positivo" | "Neutro" | "Negativo", acao: '', data: '' });
  const [formInf, setFormInf] = useState({ nome: '', rede: 'Instagram', seguidores: '', engajamento: '', mencoes: '', acao: '' });
  const [formTend, setFormTend] = useState({ titulo: '', rede: 'TikTok', crescimento: '', recomendacao: '' });

  const [mostrarFormMencao, setMostrarFormMencao] = useState(false);
  const [mostrarFormInf, setMostrarFormInf] = useState(false);
  const [mostrarFormTend, setMostrarFormTend] = useState(false);

  const adicionarMencao = () => {
    if (!formMencao.descricao.trim()) { toast.error('Descreva a menção.'); return; }
    setMencoes(prev => [{ id: Date.now(), ...formMencao, data: formMencao.data || new Date().toLocaleDateString('pt-BR') }, ...prev]);
    setFormMencao({ rede: 'Instagram', descricao: '', tipo: 'Positivo', acao: '', data: '' });
    setMostrarFormMencao(false);
    toast.success('Menção registrada.');
  };

  const adicionarInfluenciador = () => {
    if (!formInf.nome.trim()) { toast.error('Informe o nome do influenciador.'); return; }
    setInfluenciadores(prev => [...prev, { id: Date.now(), ...formInf }]);
    setFormInf({ nome: '', rede: 'Instagram', seguidores: '', engajamento: '', mencoes: '', acao: '' });
    setMostrarFormInf(false);
    toast.success('Influenciador adicionado.');
  };

  const adicionarTendencia = () => {
    if (!formTend.titulo.trim()) { toast.error('Informe o nome da tendência.'); return; }
    setTendencias(prev => [...prev, { id: Date.now(), ...formTend }]);
    setFormTend({ titulo: '', rede: 'TikTok', crescimento: '', recomendacao: '' });
    setMostrarFormTend(false);
    toast.success('Tendência registrada.');
  };

  const positivas = mencoes.filter(m => m.tipo === 'Positivo').length;
  const negativas = mencoes.filter(m => m.tipo === 'Negativo').length;
  const neutras = mencoes.filter(m => m.tipo === 'Neutro').length;

  const tipoBadge = (tipo: "Positivo" | "Neutro" | "Negativo") => {
    const cls = tipo === 'Positivo' ? 'bg-green-100 text-green-700' : tipo === 'Negativo' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700';
    return <Badge className={cls}>{tipo}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Monitoramento automático de menções requer integração com APIs</p>
              <p className="text-sm text-slate-600 mt-1">
                Para monitorar menções em tempo real, conecte ferramentas como Brandwatch, Mention ou a API oficial do Instagram. Por enquanto, registre manualmente as menções e tendências identificadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contadores reais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Menções Registradas</p>
          <p className="text-2xl font-bold text-blue-600">{mencoes.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Positivas</p>
          <p className="text-2xl font-bold text-green-600">{positivas}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Negativas</p>
          <p className="text-2xl font-bold text-red-600">{negativas}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Influenciadores</p>
          <p className="text-2xl font-bold text-purple-600">{influenciadores.length}</p>
        </div>
      </div>

      {/* Menções */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Menções e Sentimentos
              </CardTitle>
              <CardDescription>Registre menções coletadas manualmente nas redes sociais</CardDescription>
            </div>
            <Button size="sm" onClick={() => setMostrarFormMencao(!mostrarFormMencao)} className="gap-1">
              <Plus className="w-4 h-4" /> Registrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostrarFormMencao && (
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Rede Social</label>
                  <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formMencao.rede} onChange={e => setFormMencao(f => ({ ...f, rede: e.target.value }))}>
                    {REDES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Tipo</label>
                  <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formMencao.tipo} onChange={e => setFormMencao(f => ({ ...f, tipo: e.target.value as "Positivo" | "Neutro" | "Negativo" }))}>
                    <option>Positivo</option><option>Neutro</option><option>Negativo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Data</label>
                  <input type="date" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formMencao.data} onChange={e => setFormMencao(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Descrição da Menção</label>
                  <input type="text" placeholder="Ex: Usuário postou review positivo do Pijama Carol" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formMencao.descricao} onChange={e => setFormMencao(f => ({ ...f, descricao: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Ação (opcional)</label>
                  <input type="text" placeholder="Ex: Repostar e dar crédito" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formMencao.acao} onChange={e => setFormMencao(f => ({ ...f, acao: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarMencao} className="bg-green-600 hover:bg-green-700">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setMostrarFormMencao(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {mencoes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Nenhuma menção registrada. Monitore suas redes sociais e registre menções relevantes aqui.</p>
          ) : (
            mencoes.map((m) => (
              <div key={m.id} className={`border rounded-lg p-4 ${m.tipo === 'Negativo' ? 'border-red-200 bg-red-50/30' : m.tipo === 'Positivo' ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{m.rede}</Badge>
                      {tipoBadge(m.tipo)}
                      <span className="text-xs text-slate-500">{m.data}</span>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm">{m.descricao}</p>
                  </div>
                </div>
                {m.acao && <p className="text-xs text-blue-700 font-semibold mt-1">Ação: {m.acao}</p>}
                <Button size="sm" variant="outline" className="mt-2 text-red-600 text-xs" onClick={() => setMencoes(p => p.filter(x => x.id !== m.id))}>Remover</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Influenciadores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Influenciadores que Mencionaram
              </CardTitle>
              <CardDescription>Influenciadores que falaram da Feminnita — oportunidades de parceria</CardDescription>
            </div>
            <Button size="sm" onClick={() => setMostrarFormInf(!mostrarFormInf)} className="gap-1">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostrarFormInf && (
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome / @</label>
                  <input type="text" placeholder="@carolinfluencer" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formInf.nome} onChange={e => setFormInf(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Rede</label>
                  <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formInf.rede} onChange={e => setFormInf(f => ({ ...f, rede: e.target.value }))}>
                    {REDES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Seguidores</label>
                  <input type="text" placeholder="850K" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formInf.seguidores} onChange={e => setFormInf(f => ({ ...f, seguidores: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Engajamento</label>
                  <input type="text" placeholder="12.5%" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formInf.engajamento} onChange={e => setFormInf(f => ({ ...f, engajamento: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Menções</label>
                  <input type="text" placeholder="156" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formInf.mencoes} onChange={e => setFormInf(f => ({ ...f, mencoes: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Ação</label>
                  <input type="text" placeholder="Ex: Propor parceria" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formInf.acao} onChange={e => setFormInf(f => ({ ...f, acao: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarInfluenciador} className="bg-green-600 hover:bg-green-700">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setMostrarFormInf(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {influenciadores.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Nenhum influenciador cadastrado. Adicione influenciadores que mencionaram a Feminnita.</p>
          ) : (
            influenciadores.map((inf) => (
              <div key={inf.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{inf.nome}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{inf.rede}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {inf.seguidores && <div><p className="text-slate-500 text-xs">Seguidores</p><p className="font-bold">{inf.seguidores}</p></div>}
                  {inf.engajamento && <div><p className="text-slate-500 text-xs">Engajamento</p><p className="font-bold text-purple-600">{inf.engajamento}</p></div>}
                  {inf.mencoes && <div><p className="text-slate-500 text-xs">Menções</p><p className="font-bold text-green-600">{inf.mencoes}</p></div>}
                  {inf.acao && <div><p className="text-slate-500 text-xs">Ação</p><p className="font-bold text-blue-600 text-xs">{inf.acao}</p></div>}
                </div>
                <Button size="sm" variant="outline" className="mt-2 text-red-600 text-xs" onClick={() => setInfluenciadores(p => p.filter(x => x.id !== inf.id))}>Remover</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Tendências */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Tendências de Conteúdo
              </CardTitle>
              <CardDescription>Hashtags, formatos e temas em alta nas redes sociais</CardDescription>
            </div>
            <Button size="sm" onClick={() => setMostrarFormTend(!mostrarFormTend)} className="gap-1">
              <Plus className="w-4 h-4" /> Registrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostrarFormTend && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Tendência / Hashtag</label>
                  <input type="text" placeholder="Ex: #PijamaChallenge" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formTend.titulo} onChange={e => setFormTend(f => ({ ...f, titulo: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Rede Social</label>
                  <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formTend.rede} onChange={e => setFormTend(f => ({ ...f, rede: e.target.value }))}>
                    {REDES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Crescimento</label>
                  <input type="text" placeholder="Ex: +45%" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formTend.crescimento} onChange={e => setFormTend(f => ({ ...f, crescimento: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Recomendação</label>
                  <input type="text" placeholder="Ex: Criar série de unboxing" className="w-full px-2 py-1 border border-slate-300 rounded text-sm" value={formTend.recomendacao} onChange={e => setFormTend(f => ({ ...f, recomendacao: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={adicionarTendencia} className="bg-green-600 hover:bg-green-700">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setMostrarFormTend(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {tendencias.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Nenhuma tendência registrada. Monitore hashtags e formatos em alta e registre aqui.</p>
          ) : (
            tendencias.map((tend) => (
              <div key={tend.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{tend.titulo}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">{tend.rede}</Badge>
                    {tend.crescimento && <Badge className="bg-green-100 text-green-700">{tend.crescimento}</Badge>}
                  </div>
                </div>
                {tend.recomendacao && (
                  <div className="bg-blue-50 rounded p-2 text-xs text-blue-700 mt-2">
                    <p className="font-semibold">💡 {tend.recomendacao}</p>
                  </div>
                )}
                <Button size="sm" variant="outline" className="mt-2 text-red-600 text-xs" onClick={() => setTendencias(p => p.filter(x => x.id !== tend.id))}>Remover</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Guia de monitoramento */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Como Monitorar Sentimento nas Redes Sociais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Verifique notificações do Instagram e TikTok diariamente para menções",
            "Use Instagram Insights → Conteúdo para ver posts que marcaram você",
            "Pesquise #Feminnita e variações nas redes sociais semanalmente",
            "Salve prints de menções positivas para usar como prova social",
            "Responda menções negativas em até 2h para evitar amplificação",
            "Construa lista de influenciadores que mencionam organicamente",
            "Para monitoramento automático, conecte ferramentas como Mention ou Brandwatch",
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">✅ {dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
