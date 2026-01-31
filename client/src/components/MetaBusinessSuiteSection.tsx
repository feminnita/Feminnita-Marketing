import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Instagram, TrendingUp, BarChart3, CheckCircle, AlertCircle, Share2 } from "lucide-react";
import { useState } from "react";

export default function MetaBusinessSuiteSection() {
  const [conectado, setConectado] = useState(false);
  const [metaKey, setMetaKey] = useState("");
  const [contas, setContas] = useState([
    {
      id: 1,
      nome: "Feminnita Oficial",
      plataforma: "Instagram",
      seguidores: 15420,
      engajamento: 8.5,
      alcance: 45230,
      status: "ativo"
    },
    {
      id: 2,
      nome: "Feminnita TikTok",
      plataforma: "TikTok",
      seguidores: 8950,
      engajamento: 12.3,
      alcance: 125680,
      status: "ativo"
    }
  ]);

  const [metricas, setMetricas] = useState({
    impressoes: 234567,
    alcance: 89234,
    engajamentos: 7654,
    cliques: 2345,
    conversoes: 234,
    receita: 12340
  });

  const [posts, setPosts] = useState([
    {
      id: 1,
      titulo: "Story - Renda Extra",
      plataforma: "Instagram",
      tipo: "story",
      data: "2026-01-31",
      status: "publicado",
      alcance: 5230,
      engajamento: 456,
      cliques: 123
    },
    {
      id: 2,
      titulo: "Reels - Bastidores",
      plataforma: "Instagram",
      tipo: "reels",
      data: "2026-01-31",
      status: "publicado",
      alcance: 12450,
      engajamento: 1234,
      cliques: 345
    },
    {
      id: 3,
      titulo: "TikTok - ASMR",
      plataforma: "TikTok",
      tipo: "tiktok",
      data: "2026-01-30",
      status: "publicado",
      alcance: 45230,
      engajamento: 5234,
      cliques: 876
    }
  ]);

  const conectarMeta = () => {
    if (metaKey.trim()) {
      setConectado(true);
    }
  };

  const publicarAgora = (id: number) => {
    alert(`Post ${id} publicado em todas as redes!`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração Meta Business Suite</h2>
        <p className="text-slate-600">
          Publique e monitore métricas em tempo real diretamente do Instagram e Facebook sem sair da plataforma.
        </p>
      </div>

      {/* Conexão com Meta */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Instagram className="w-5 h-5 text-blue-600" />
            Conectar Meta Business Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!conectado ? (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Token de Acesso Meta</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Seu token de acesso Meta"
                    value={metaKey}
                    onChange={(e) => setMetaKey(e.target.value)}
                    type="password"
                    className="flex-1"
                  />
                  <Button 
                    onClick={conectarMeta}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Conectar
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Encontre seu token em: Meta Business Suite → Configurações → Tokens
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-900 mb-2">Como Obter Seu Token Meta:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Acesse business.facebook.com</li>
                  <li>Vá para Configurações → Tokens</li>
                  <li>Clique em "Gerar Novo Token"</li>
                  <li>Selecione suas contas Instagram/Facebook</li>
                  <li>Cole aqui e clique em Conectar</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-semibold text-green-900">✅ Conectado com Sucesso</p>
                <p className="text-sm text-green-700">Meta Business Suite está pronto para usar</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setConectado(false);
                  setMetaKey("");
                }}
              >
                Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {conectado && (
        <>
          {/* Contas Conectadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contas Conectadas</CardTitle>
              <CardDescription>Suas contas Instagram e Facebook</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contas.map((conta) => (
                  <div key={conta.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{conta.nome}</h4>
                        <p className="text-sm text-slate-600">{conta.plataforma}</p>
                      </div>
                      <Badge className="bg-green-600">✅ Ativo</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-600">Seguidores</p>
                        <p className="font-bold text-slate-900">{conta.seguidores.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Engajamento</p>
                        <p className="font-bold text-slate-900">{conta.engajamento}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Alcance</p>
                        <p className="font-bold text-slate-900">{conta.alcance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas em Tempo Real */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métricas em Tempo Real
              </CardTitle>
              <CardDescription>Performance de suas campanhas hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { titulo: "Impressões", valor: metricas.impressoes.toLocaleString(), icon: "👁️" },
                  { titulo: "Alcance", valor: metricas.alcance.toLocaleString(), icon: "📊" },
                  { titulo: "Engajamentos", valor: metricas.engajamentos.toLocaleString(), icon: "❤️" },
                  { titulo: "Cliques", valor: metricas.cliques.toLocaleString(), icon: "🖱️" },
                  { titulo: "Conversões", valor: metricas.conversoes, icon: "💰" },
                  { titulo: "Receita", valor: `R$ ${metricas.receita.toLocaleString()}`, icon: "💵" }
                ].map((metrica, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition">
                    <p className="text-2xl mb-2">{metrica.icon}</p>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{metrica.titulo}</p>
                    <p className="text-2xl font-bold text-slate-900">{metrica.valor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posts Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posts Recentes</CardTitle>
              <CardDescription>Performance de seus últimos posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{post.titulo}</h4>
                        <p className="text-xs text-slate-600">{post.plataforma} • {post.data}</p>
                      </div>
                      <Badge variant="outline">{post.status}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                      <div>
                        <p className="text-slate-600">Alcance</p>
                        <p className="font-bold text-slate-900">{post.alcance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Engajamento</p>
                        <p className="font-bold text-slate-900">{post.engajamento.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Cliques</p>
                        <p className="font-bold text-slate-900">{post.cliques.toLocaleString()}</p>
                      </div>
                    </div>

                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      Ver Detalhes Completos
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Publicar Diretamente */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-600" />
                Publicar Diretamente
              </CardTitle>
              <CardDescription>Publique seus roteiros em todas as redes com 1 clique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { titulo: "Story - Renda Extra", rede: "Instagram" },
                  { titulo: "Reels - Bastidores", rede: "Instagram" },
                  { titulo: "TikTok - ASMR", rede: "TikTok" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-green-200 rounded bg-white">
                    <div>
                      <p className="font-semibold text-slate-900">{item.titulo}</p>
                      <p className="text-xs text-slate-600">{item.rede}</p>
                    </div>
                    <Button 
                      onClick={() => publicarAgora(idx)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Publicar Agora
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Dicas para Máximo Impacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "✅ Publique nos horários ideais (19h-21h para máximo engajamento)",
                "✅ Acompanhe métricas em tempo real para otimizar próximas campanhas",
                "✅ Use dados de alcance para identificar melhor público-alvo",
                "✅ Responda comentários nos primeiros 30 minutos após publicar",
                "✅ Compare performance entre plataformas para alocar recursos",
                "✅ Crie posts de teste para validar antes de investir em ads"
              ].map((dica, idx) => (
                <p key={idx} className="text-slate-700">{dica}</p>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {!conectado && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg">Por que usar Meta Business Suite?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { titulo: "Publique em 1 Clique", descricao: "Publique em Instagram e Facebook simultaneamente" },
              { titulo: "Métricas em Tempo Real", descricao: "Acompanhe performance de cada post ao vivo" },
              { titulo: "Gerenciamento Centralizado", descricao: "Controle múltiplas contas de um único lugar" },
              { titulo: "Análise Profunda", descricao: "Entenda seu público e otimize estratégia" },
              { titulo: "Integração Perfeita", descricao: "Funciona perfeitamente com Zapier e IA" },
              { titulo: "Suporte Oficial", descricao: "Acesso a recursos e suporte do Meta" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-amber-600">✓</span>
                <div>
                  <p className="font-semibold text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-600">{item.descricao}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
