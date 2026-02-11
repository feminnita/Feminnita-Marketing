import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MessageCircle, BookOpen, Settings, Plus, Trash2, CheckCircle2, AlertCircle, Brain } from "lucide-react";

export default function AITrainingDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("training");
  const [showAddForm, setShowAddForm] = useState(false);

  // Formulários
  const [trainingForm, setTrainingForm] = useState({
    userMessage: "",
    expectedResponse: "",
    category: "",
    shouldEscalate: false,
    escalationReason: "",
  });

  const [knowledgeForm, setKnowledgeForm] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    contentType: "product" as const,
  });

  // Queries
  const { data: trainingExamples } = trpc.aiCustomerSupport.listTrainingExamples.useQuery({
    limit: 50,
  });

  const { data: knowledgeItems } = trpc.aiCustomerSupport.listKnowledgeItems.useQuery({
    limit: 50,
  });

  const { data: aiStats } = trpc.aiCustomerSupport.getAIStats.useQuery();
  const { data: aiSettings } = trpc.aiCustomerSupport.getAISettings.useQuery();

  // Mutations
  const addTrainingMutation = trpc.aiCustomerSupport.addTrainingExample.useMutation({
    onSuccess: () => {
      setTrainingForm({
        userMessage: "",
        expectedResponse: "",
        category: "",
        shouldEscalate: false,
        escalationReason: "",
      });
      setShowAddForm(false);
    },
  });

  const addKnowledgeMutation = trpc.aiCustomerSupport.addKnowledgeItem.useMutation({
    onSuccess: () => {
      setKnowledgeForm({
        title: "",
        description: "",
        url: "",
        category: "",
        contentType: "product",
      });
      setShowAddForm(false);
    },
  });

  const handleAddTraining = () => {
    addTrainingMutation.mutate(trainingForm);
  };

  const handleAddKnowledge = () => {
    addKnowledgeMutation.mutate(knowledgeForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8" style={{ color: "#A63D4A" }} />
            <h1 className="text-4xl font-bold text-slate-900">Dashboard de Treinamento IA</h1>
          </div>
          <p className="text-slate-600">Treine a IA de atendimento com exemplos e base de conhecimento</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Exemplos de Treinamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aiStats?.trainingExamples || 0}</div>
              <p className="text-xs text-slate-500 mt-1">exemplos adicionados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Base de Conhecimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aiStats?.knowledgeItems || 0}</div>
              <p className="text-xs text-slate-500 mt-1">itens cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Conversas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aiStats?.totalConversations || 0}</div>
              <p className="text-xs text-slate-500 mt-1">processadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Taxa de Escalação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(aiStats?.escalationRate || 0)}%</div>
              <p className="text-xs text-slate-500 mt-1">conversas escaladas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Treinamento</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Base de Conhecimento</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Testar IA</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: Treinamento */}
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Exemplos de Treinamento</CardTitle>
                    <CardDescription>
                      Adicione exemplos de conversas para treinar a IA
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="gap-2"
                    style={{ backgroundColor: "#A63D4A" }}
                  >
                    <Plus className="w-4 h-4" />
                    Novo Exemplo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Mensagem do Cliente</label>
                      <Textarea
                        placeholder="Ex: Qual é o tamanho disponível?"
                        value={trainingForm.userMessage}
                        onChange={(e) =>
                          setTrainingForm({ ...trainingForm, userMessage: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Resposta Esperada</label>
                      <Textarea
                        placeholder="Ex: Temos tamanhos P, M, G e GG disponíveis..."
                        value={trainingForm.expectedResponse}
                        onChange={(e) =>
                          setTrainingForm({ ...trainingForm, expectedResponse: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Categoria</label>
                        <Input
                          placeholder="Ex: Tamanho, Cor, Preço"
                          value={trainingForm.category}
                          onChange={(e) =>
                            setTrainingForm({ ...trainingForm, category: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={trainingForm.shouldEscalate}
                            onChange={(e) =>
                              setTrainingForm({
                                ...trainingForm,
                                shouldEscalate: e.target.checked,
                              })
                            }
                          />
                          <span className="text-sm font-medium">Deve Escalar?</span>
                        </label>
                      </div>
                    </div>

                    {trainingForm.shouldEscalate && (
                      <div>
                        <label className="text-sm font-medium">Motivo da Escalação</label>
                        <Input
                          placeholder="Ex: Reclamação de cliente"
                          value={trainingForm.escalationReason}
                          onChange={(e) =>
                            setTrainingForm({
                              ...trainingForm,
                              escalationReason: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddTraining}
                        disabled={!trainingForm.userMessage || !trainingForm.expectedResponse}
                        style={{ backgroundColor: "#A63D4A" }}
                      >
                        Salvar Exemplo
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {trainingExamples && trainingExamples.length > 0 ? (
                    trainingExamples.map((example, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">
                              Cliente: {example.userMessage}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              IA: {example.expectedResponse}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {example.category && (
                            <Badge variant="secondary">{example.category}</Badge>
                          )}
                          {example.shouldEscalate && (
                            <Badge variant="destructive">Escalação</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum exemplo de treinamento ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Base de Conhecimento */}
          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Base de Conhecimento</CardTitle>
                    <CardDescription>
                      Produtos, FAQs e informações que a IA pode consultar
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setActiveTab("knowledge");
                      setShowAddForm(!showAddForm);
                    }}
                    className="gap-2"
                    style={{ backgroundColor: "#A63D4A" }}
                  >
                    <Plus className="w-4 h-4" />
                    Novo Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm && activeTab === "knowledge" && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tipo de Conteúdo</label>
                      <select
                        value={knowledgeForm.contentType}
                        onChange={(e) =>
                          setKnowledgeForm({
                            ...knowledgeForm,
                            contentType: e.target.value as any,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="product">Produto</option>
                        <option value="faq">FAQ</option>
                        <option value="policy">Política</option>
                        <option value="promotion">Promoção</option>
                        <option value="general_info">Informação Geral</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Título</label>
                      <Input
                        placeholder="Ex: Pijama Conforto Premium"
                        value={knowledgeForm.title}
                        onChange={(e) =>
                          setKnowledgeForm({ ...knowledgeForm, title: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea
                        placeholder="Descrição detalhada do produto ou informação"
                        value={knowledgeForm.description}
                        onChange={(e) =>
                          setKnowledgeForm({
                            ...knowledgeForm,
                            description: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">URL/Link</label>
                        <Input
                          placeholder="https://..."
                          value={knowledgeForm.url}
                          onChange={(e) =>
                            setKnowledgeForm({ ...knowledgeForm, url: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Categoria</label>
                        <Input
                          placeholder="Ex: Pijamas, Roupa de Cama"
                          value={knowledgeForm.category}
                          onChange={(e) =>
                            setKnowledgeForm({
                              ...knowledgeForm,
                              category: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddKnowledge}
                        disabled={!knowledgeForm.title}
                        style={{ backgroundColor: "#A63D4A" }}
                      >
                        Salvar Item
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {knowledgeItems && knowledgeItems.length > 0 ? (
                    knowledgeItems.map((item, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              >
                                {item.url}
                              </a>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{item.contentType}</Badge>
                          {item.category && (
                            <Badge variant="secondary">{item.category}</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item na base de conhecimento</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Configurações */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de IA</CardTitle>
                <CardDescription>
                  Ajuste o comportamento e sensibilidade da IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Prompt do Sistema</label>
                  <Textarea
                    placeholder="Instruções personalizadas para a IA..."
                    defaultValue={aiSettings?.systemPrompt || ""}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Temperatura (0.0 - 2.0)</label>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue={aiSettings?.temperature || "0.7"}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Valores mais altos = respostas mais criativas
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Máximo de Tokens</label>
                    <Input
                      type="number"
                      defaultValue={aiSettings?.maxTokens || "500"}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Comprimento máximo da resposta
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Auto-escalar após N mensagens
                  </label>
                  <Input
                    type="number"
                    defaultValue={aiSettings?.autoEscalateAfterMessages || "5"}
                    className="mt-1"
                  />
                </div>

                <Button style={{ backgroundColor: "#A63D4A" }}>
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Testar IA */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Testar IA de Atendimento</CardTitle>
                <CardDescription>
                  Envie uma mensagem para testar a resposta da IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Sua Mensagem</label>
                  <Textarea
                    placeholder="Teste uma pergunta aqui..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button style={{ backgroundColor: "#A63D4A" }}>
                  Testar Resposta da IA
                </Button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Resposta da IA:</p>
                  <p className="text-sm text-blue-800">
                    Aqui aparecerá a resposta da IA quando você testar...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
