import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Zap, Link2, CheckCircle, AlertCircle, Workflow } from "lucide-react";
import { useState } from "react";

export default function IntegracaoZapierSection() {
  const [conectado, setConectado] = useState(false);
  const [zapierKey, setZapierKey] = useState("");
  const [automacoes, setAutomacoes] = useState<{ id: number; nome: string; descricao: string; status: string; acionamentos: number; criado: string }[]>([]);

  const conectarZapier = () => {
    if (zapierKey.trim()) {
      setConectado(true);
    }
  };

  const templates = [
    {
      nome: "Story → Instagram",
      descricao: "Publica story automaticamente no Instagram",
      trigger: "Novo story criado",
      action: "Publica no Instagram",
      tempo: "Imediato"
    },
    {
      nome: "Reels → Instagram",
      descricao: "Publica reels automaticamente no Instagram",
      trigger: "Novo reels criado",
      action: "Publica no Instagram",
      tempo: "Imediato"
    },
    {
      nome: "Vídeo → TikTok",
      descricao: "Publica vídeo automaticamente no TikTok",
      trigger: "Novo vídeo criado",
      action: "Publica no TikTok",
      tempo: "Imediato"
    },
    {
      nome: "Agendamento Automático",
      descricao: "Agenda postagens para horários específicos",
      trigger: "Horário definido",
      action: "Publica em todas as redes",
      tempo: "Agendado"
    },
    {
      nome: "Sincronizar com Google Sheets",
      descricao: "Sincroniza métricas com Google Sheets",
      trigger: "Diariamente",
      action: "Atualiza planilha",
      tempo: "Automático"
    },
    {
      nome: "Enviar Relatório por Email",
      descricao: "Envia relatório semanal por email",
      trigger: "Toda segunda-feira",
      action: "Envia email",
      tempo: "Agendado"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração com Zapier/Make</h2>
        <p className="text-slate-600">
          Automatize a publicação de Stories, Reels e Ads diretamente para Instagram e TikTok sem sair da plataforma.
        </p>
      </div>

      {/* Conexão com Zapier */}
      <Card className="border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Conectar Zapier/Make
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!conectado ? (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Chave de API Zapier</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Sua chave de API Zapier"
                    value={zapierKey}
                    onChange={(e) => setZapierKey(e.target.value)}
                    type="password"
                    className="flex-1"
                  />
                  <Button 
                    onClick={conectarZapier}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Conectar
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Encontre sua chave em: Zapier → Account Settings → API
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-900 mb-2">Como Obter Sua Chave Zapier:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Acesse zapier.com e faça login</li>
                  <li>Vá para Account Settings</li>
                  <li>Clique em API</li>
                  <li>Copie sua chave de API</li>
                  <li>Cole aqui e clique em Conectar</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-semibold text-green-900">✅ Conectado com Sucesso</p>
                <p className="text-sm text-green-700">Zapier está pronto para automatizar suas postagens</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setConectado(false);
                  setZapierKey("");
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
          {/* Automações Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Automações Ativas</CardTitle>
              <CardDescription>Suas automações Zapier em funcionamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automacoes.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Nenhuma automação criada ainda. Conecte o Zapier e use os templates abaixo para começar.</p>
                ) : automacoes.map((auto) => (
                  <div key={auto.id} className="border border-slate-200 rounded-lg p-4 hover:border-yellow-300 hover:bg-yellow-50 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{auto.nome}</h4>
                        <p className="text-sm text-slate-600">{auto.descricao}</p>
                      </div>
                      <Badge variant={auto.status === "ativo" ? "default" : "secondary"}>
                        {auto.status === "ativo" ? "✅ Ativo" : "⏸️ Inativo"}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span>Acionamentos: {auto.acionamentos}</span>
                      <span>Criado: {auto.criado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Templates de Automação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Templates de Automação
              </CardTitle>
              <CardDescription>Crie novas automações com estes templates pré-configurados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((template, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-yellow-300 hover:bg-yellow-50 transition">
                    <h4 className="font-bold text-slate-900 mb-2">{template.nome}</h4>
                    <p className="text-sm text-slate-600 mb-3">{template.descricao}</p>
                    
                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Trigger:</span>
                        <Badge variant="outline">{template.trigger}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Ação:</span>
                        <Badge variant="outline">{template.action}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Tempo:</span>
                        <Badge variant="outline">{template.tempo}</Badge>
                      </div>
                    </div>

                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Criar Automação
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefícios */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Benefícios da Automação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                "✅ Poupe 10+ horas por semana em postagens manuais",
                "✅ Publique em múltiplas redes simultaneamente",
                "✅ Nunca perca um horário de postagem",
                "✅ Mantenha consistência em todas as plataformas",
                "✅ Agende postagens com antecedência",
                "✅ Sincronize dados com Google Sheets/Excel",
                "✅ Receba relatórios automáticos por email",
                "✅ Integre com 5.000+ aplicativos"
              ].map((beneficio, idx) => (
                <p key={idx} className="text-slate-700">{beneficio}</p>
              ))}
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Próximas Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. ✅ Zapier conectado com sucesso</p>
              <p>2. 🔧 Escolha um template de automação acima</p>
              <p>3. ⚙️ Configure as credenciais do Instagram/TikTok</p>
              <p>4. 🧪 Teste a automação com um post de teste</p>
              <p>5. 🚀 Ative a automação para produção</p>
              <p>6. 📊 Monitore acionamentos e erros</p>
            </CardContent>
          </Card>
        </>
      )}

      {!conectado && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg">Por que Automatizar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { titulo: "Economize Tempo", descricao: "Poupe 10+ horas por semana em postagens manuais" },
              { titulo: "Consistência", descricao: "Publique sempre nos horários ideais, sem falhas" },
              { titulo: "Escalabilidade", descricao: "Gerencie múltiplas redes e contas facilmente" },
              { titulo: "Produtividade", descricao: "Foque em estratégia enquanto Zapier publica" },
              { titulo: "Integração", descricao: "Conecte com 5.000+ aplicativos (Sheets, Slack, etc)" },
              { titulo: "Relatórios", descricao: "Receba relatórios automáticos de performance" }
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
