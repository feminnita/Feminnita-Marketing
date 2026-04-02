import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Concorrente {
  id: number;
  nome: string;
  preco_medio: number;
  seguidores: number;
  engajamento: number;
  posts_semana: number;
  estrategia: string;
  forca: string;
  fraqueza: string;
}

interface Alerta {
  id: number;
  titulo: string;
  descricao: string;
  urgencia: "Alta" | "Média" | "Baixa";
}

interface DadosFeminnita {
  preco_medio: string;
  seguidores: string;
  engajamento: string;
  posts_semana: string;
}

export default function AnaliseConorrentesAutomaticoSection() {
  const [concorrentes, setConcorrentes] = useState<Concorrente[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [feminnita, setFeminnita] = useState<DadosFeminnita>({ preco_medio: '', seguidores: '', engajamento: '', posts_semana: '' });
  const [femInitialized, setFemInitialized] = useState(false);
  const [editFem, setEditFem] = useState(false);

  const [novoConcorrente, setNovoConcorrente] = useState(false);
  const [formC, setFormC] = useState({ nome: '', preco_medio: '', seguidores: '', engajamento: '', posts_semana: '', estrategia: '', forca: '', fraqueza: '' });

  const [novoAlerta, setNovoAlerta] = useState(false);
  const [formA, setFormA] = useState({ titulo: '', descricao: '', urgencia: 'Alta' as Alerta['urgencia'] });

  const adicionarConcorrente = () => {
    if (!formC.nome.trim()) { toast.error('Informe o nome do concorrente.'); return; }
    const novo: Concorrente = {
      id: Date.now(),
      nome: formC.nome,
      preco_medio: parseFloat(formC.preco_medio) || 0,
      seguidores: parseInt(formC.seguidores) || 0,
      engajamento: parseFloat(formC.engajamento) || 0,
      posts_semana: parseInt(formC.posts_semana) || 0,
      estrategia: formC.estrategia,
      forca: formC.forca,
      fraqueza: formC.fraqueza,
    };
    setConcorrentes(prev => [...prev, novo]);
    setFormC({ nome: '', preco_medio: '', seguidores: '', engajamento: '', posts_semana: '', estrategia: '', forca: '', fraqueza: '' });
    setNovoConcorrente(false);
    toast.success('Concorrente adicionado.');
  };

  const removerConcorrente = (id: number) => {
    setConcorrentes(prev => prev.filter(c => c.id !== id));
  };

  const adicionarAlerta = () => {
    if (!formA.titulo.trim()) { toast.error('Informe o título do alerta.'); return; }
    const novo: Alerta = { id: Date.now(), titulo: formA.titulo, descricao: formA.descricao, urgencia: formA.urgencia };
    setAlertas(prev => [novo, ...prev]);
    setFormA({ titulo: '', descricao: '', urgencia: 'Alta' });
    setNovoAlerta(false);
    toast.success('Alerta registrado.');
  };

  const removerAlerta = (id: number) => setAlertas(prev => prev.filter(a => a.id !== id));

  const salvarFeminnita = () => {
    setFemInitialized(true);
    setEditFem(false);
    toast.success('Dados da Feminnita salvos.');
  };

  const femPreco = parseFloat(feminnita.preco_medio) || 0;
  const femEng = parseFloat(feminnita.engajamento) || 0;
  const femSeg = parseInt(feminnita.seguidores) || 0;
  const mediaPreco = concorrentes.length > 0 ? concorrentes.reduce((s, c) => s + c.preco_medio, 0) / concorrentes.length : 0;
  const mediaEng = concorrentes.length > 0 ? concorrentes.reduce((s, c) => s + c.engajamento, 0) / concorrentes.length : 0;

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Análise de Concorrentes
          </CardTitle>
          <CardDescription>
            Cadastre concorrentes manualmente e compare preços, engajamento e estratégias. Registre alertas competitivos à medida que os observa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aviso */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Monitoramento automático requer integração de API</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Para rastrear concorrentes em tempo real, é necessário integrar APIs de redes sociais no backend. Por enquanto, cadastre dados manualmente com base na sua pesquisa.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Feminnita */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Seus Dados (Feminnita)</h3>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditFem(!editFem)}>
                {editFem ? 'Cancelar' : femInitialized ? 'Editar' : 'Cadastrar'}
              </Button>
            </div>

            {editFem ? (
              <Card className="p-4 bg-pink-50 border-pink-200">
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Preço Médio (R$)</label>
                    <input type="number" min="0" step="0.01" placeholder="49.90" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={feminnita.preco_medio} onChange={e => setFeminnita(f => ({ ...f, preco_medio: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Seguidores</label>
                    <input type="number" min="0" placeholder="15000" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={feminnita.seguidores} onChange={e => setFeminnita(f => ({ ...f, seguidores: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Engajamento (%)</label>
                    <input type="number" min="0" step="0.1" placeholder="8.8" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={feminnita.engajamento} onChange={e => setFeminnita(f => ({ ...f, engajamento: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Posts por Semana</label>
                    <input type="number" min="0" placeholder="3" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={feminnita.posts_semana} onChange={e => setFeminnita(f => ({ ...f, posts_semana: e.target.value }))} />
                  </div>
                </div>
                <Button onClick={salvarFeminnita} className="w-full bg-pink-600 hover:bg-pink-700">Salvar</Button>
              </Card>
            ) : femInitialized ? (
              <div className="grid md:grid-cols-3 gap-3">
                <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Preço Médio</h4>
                    {mediaPreco > 0 && (femPreco > mediaPreco ? <TrendingUp className="w-4 h-4 text-red-600" /> : <TrendingDown className="w-4 h-4 text-green-600" />)}
                  </div>
                  <p className="text-2xl font-bold text-pink-600">R$ {femPreco.toFixed(2)}</p>
                  {mediaPreco > 0 && (
                    <p className={`text-xs mt-1 ${femPreco > mediaPreco ? 'text-red-600' : 'text-green-600'}`}>
                      {femPreco > mediaPreco ? '+' : '-'} R$ {Math.abs(femPreco - mediaPreco).toFixed(2)} vs média
                    </p>
                  )}
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Engajamento</h4>
                    {mediaEng > 0 && (femEng > mediaEng ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />)}
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{femEng.toFixed(1)}%</p>
                  {mediaEng > 0 && (
                    <p className={`text-xs mt-1 ${femEng > mediaEng ? 'text-green-600' : 'text-red-600'}`}>
                      {femEng > mediaEng ? '+' : ''}{(femEng - mediaEng).toFixed(1)}% vs média
                    </p>
                  )}
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                  <h4 className="text-sm font-semibold mb-2">Seguidores</h4>
                  <p className="text-2xl font-bold text-purple-600">{femSeg.toLocaleString()}</p>
                  <p className="text-xs text-slate-600 mt-1">{feminnita.posts_semana || '—'} posts/semana</p>
                </Card>
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-slate-300 rounded-lg">
                <p className="text-slate-500 text-sm">Clique em "Cadastrar" para inserir os dados da Feminnita.</p>
              </div>
            )}
          </div>

          {/* Concorrentes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Concorrentes Monitorados</h3>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setNovoConcorrente(!novoConcorrente)}>
                <Plus className="w-3 h-3" />
                Adicionar
              </Button>
            </div>

            {novoConcorrente && (
              <Card className="p-4 bg-purple-50 border-purple-200 mb-3">
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1">Nome do Concorrente</label>
                      <input type="text" placeholder="Ex: Lua Chic Pijamas" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.nome} onChange={e => setFormC(f => ({ ...f, nome: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Preço Médio (R$)</label>
                      <input type="number" min="0" step="0.01" placeholder="49.90" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.preco_medio} onChange={e => setFormC(f => ({ ...f, preco_medio: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Seguidores</label>
                      <input type="number" min="0" placeholder="45000" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.seguidores} onChange={e => setFormC(f => ({ ...f, seguidores: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Engajamento (%)</label>
                      <input type="number" min="0" step="0.1" placeholder="8.5" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.engajamento} onChange={e => setFormC(f => ({ ...f, engajamento: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Posts por Semana</label>
                      <input type="number" min="0" placeholder="3" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.posts_semana} onChange={e => setFormC(f => ({ ...f, posts_semana: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Estratégia</label>
                      <input type="text" placeholder="Ex: Lifestyle + Influenciadores" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.estrategia} onChange={e => setFormC(f => ({ ...f, estrategia: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Força</label>
                      <input type="text" placeholder="Ex: Design premium" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.forca} onChange={e => setFormC(f => ({ ...f, forca: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Fraqueza</label>
                      <input type="text" placeholder="Ex: Preço alto" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formC.fraqueza} onChange={e => setFormC(f => ({ ...f, fraqueza: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={adicionarConcorrente} className="flex-1 bg-purple-600 hover:bg-purple-700">Adicionar</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setNovoConcorrente(false)}>Cancelar</Button>
                  </div>
                </div>
              </Card>
            )}

            {concorrentes.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 text-sm">Nenhum concorrente cadastrado.</p>
                <p className="text-xs text-slate-400 mt-1">Adicione concorrentes com base na sua pesquisa de mercado.</p>
              </div>
            ) : (
              <>
                {/* Tabela comparativa */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 font-semibold">Concorrente</th>
                        <th className="text-center py-2 px-2 font-semibold">Preço</th>
                        <th className="text-center py-2 px-2 font-semibold">Seguidores</th>
                        <th className="text-center py-2 px-2 font-semibold">Engajamento</th>
                        <th className="text-center py-2 px-2 font-semibold">Posts/Sem</th>
                        <th className="py-2 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {concorrentes.map(c => (
                        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-2 font-semibold text-xs">{c.nome}</td>
                          <td className="text-center py-2 px-2 text-xs">{c.preco_medio > 0 ? `R$ ${c.preco_medio.toFixed(2)}` : '—'}</td>
                          <td className="text-center py-2 px-2 text-xs">{c.seguidores > 0 ? c.seguidores.toLocaleString() : '—'}</td>
                          <td className="text-center py-2 px-2 text-xs">{c.engajamento > 0 ? `${c.engajamento.toFixed(1)}%` : '—'}</td>
                          <td className="text-center py-2 px-2 text-xs">{c.posts_semana > 0 ? c.posts_semana : '—'}</td>
                          <td className="py-2 px-2">
                            <Button size="sm" variant="ghost" className="text-red-600 h-6 w-6 p-0" onClick={() => removerConcorrente(c.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {femInitialized && (
                        <tr className="bg-pink-50 font-semibold">
                          <td className="py-2 px-2 text-xs">Feminnita</td>
                          <td className="text-center py-2 px-2 text-xs">{femPreco > 0 ? `R$ ${femPreco.toFixed(2)}` : '—'}</td>
                          <td className="text-center py-2 px-2 text-xs">{femSeg > 0 ? femSeg.toLocaleString() : '—'}</td>
                          <td className="text-center py-2 px-2 text-xs">{femEng > 0 ? `${femEng.toFixed(1)}%` : '—'}</td>
                          <td className="text-center py-2 px-2 text-xs">{feminnita.posts_semana || '—'}</td>
                          <td></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Estratégias */}
                <div className="space-y-2">
                  {concorrentes.filter(c => c.estrategia || c.forca || c.fraqueza).map(c => (
                    <Card key={c.id} className="p-3">
                      <div className="mb-2">
                        <h4 className="font-semibold text-sm">{c.nome}</h4>
                        {c.estrategia && <p className="text-xs text-slate-600">{c.estrategia}</p>}
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-xs">
                        {c.forca && (
                          <div className="bg-green-50 p-2 rounded">
                            <p className="font-semibold text-green-700">✓ Força:</p>
                            <p className="text-slate-600">{c.forca}</p>
                          </div>
                        )}
                        {c.fraqueza && (
                          <div className="bg-red-50 p-2 rounded">
                            <p className="font-semibold text-red-700">✗ Fraqueza:</p>
                            <p className="text-slate-600">{c.fraqueza}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Alertas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Alertas Competitivos</h3>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setNovoAlerta(!novoAlerta)}>
                <Plus className="w-3 h-3" />
                Registrar Alerta
              </Button>
            </div>

            {novoAlerta && (
              <Card className="p-4 bg-yellow-50 border-yellow-200 mb-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Título do Alerta</label>
                    <input type="text" placeholder="Ex: Concorrente reduziu preço" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formA.titulo} onChange={e => setFormA(f => ({ ...f, titulo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Descrição</label>
                    <input type="text" placeholder="Detalhe o que observou" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formA.descricao} onChange={e => setFormA(f => ({ ...f, descricao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Urgência</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={formA.urgencia} onChange={e => setFormA(f => ({ ...f, urgencia: e.target.value as Alerta['urgencia'] }))}>
                      <option>Alta</option>
                      <option>Média</option>
                      <option>Baixa</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={adicionarAlerta} className="flex-1 bg-yellow-600 hover:bg-yellow-700">Registrar</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setNovoAlerta(false)}>Cancelar</Button>
                  </div>
                </div>
              </Card>
            )}

            {alertas.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-300 rounded-lg">
                <p className="text-slate-500 text-sm">Nenhum alerta registrado.</p>
                <p className="text-xs text-slate-400 mt-1">Registre mudanças que observar nos concorrentes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alertas.map(alerta => (
                  <Card key={alerta.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{alerta.titulo}</h4>
                          <Badge variant={alerta.urgencia === "Alta" ? "destructive" : "default"} className="text-xs">
                            {alerta.urgencia}
                          </Badge>
                        </div>
                        {alerta.descricao && <p className="text-xs text-slate-600">{alerta.descricao}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600 h-6 w-6 p-0" onClick={() => removerAlerta(alerta.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Guia */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">💡 Como Usar a Análise Competitiva</h4>
            <ul className="text-sm space-y-1 text-slate-700">
              <li>✅ Pesquise concorrentes no Instagram/TikTok e cadastre os dados observados</li>
              <li>✅ Atualize periodicamente (semanal ou quinzenal) para manter comparação relevante</li>
              <li>✅ Registre alertas quando observar mudanças de preço, lançamentos ou estratégias</li>
              <li>✅ Use o comparativo de preço/engajamento para posicionar a Feminnita</li>
              <li>✅ Identifique forças e fraquezas dos concorrentes para diferenciar a estratégia</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
