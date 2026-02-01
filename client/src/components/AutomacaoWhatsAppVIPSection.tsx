import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Calendar, Clock, Settings } from 'lucide-react';

export default function AutomacaoWhatsAppVIPSection() {
  const [whatsappToken, setWhatsappToken] = useState('seu_token_whatsapp_aqui');
  const [grupoVIP, setGrupoVIP] = useState('22992810707');
  const [horarioDisparo, setHorarioDisparo] = useState('10:00');
  const [diasDisparo, setDiasDisparo] = useState(['terça', 'quinta']);

  const postagens = [
    {
      id: 1,
      data: '2026-02-03',
      tipo: 'Lançamento',
      produto: 'Pijama Carol - Edição Limitada',
      preco: 'R$ 89,90',
      descricao: '✨ Novo lançamento! Pijama Carol em tons pastéis, perfeito para noites de conforto. Tecido premium 100% algodão.',
      imagem: '🎀',
      link: 'https://feminnita.com/pijama-carol-limitada',
      status: 'Agendado',
      engajamento: { mensagens: 0, cliques: 0, vendas: 0 }
    },
    {
      id: 2,
      data: '2026-02-04',
      tipo: 'Retorno ao Estoque',
      produto: 'Camisola Renata - Rosa Claro',
      preco: 'R$ 79,90',
      descricao: '🔥 Voltou ao estoque! Camisola Renata que vocês tanto pediram. Edição rosa claro com detalhes em renda.',
      imagem: '👗',
      link: 'https://feminnita.com/camisola-renata-rosa',
      status: 'Agendado',
      engajamento: { mensagens: 0, cliques: 0, vendas: 0 }
    },
    {
      id: 3,
      data: '2026-02-10',
      tipo: 'Promoção',
      produto: 'Combo Vanessa + Luiza',
      preco: 'R$ 149,90 (de R$ 169,80)',
      descricao: '💝 PROMOÇÃO RELÂMPAGO! Combo Vanessa + Luiza com 12% de desconto. Apenas para VIPs! Aproveitem! 🛍️',
      imagem: '💰',
      link: 'https://feminnita.com/combo-vip-vanessa-luiza',
      status: 'Agendado',
      engajamento: { mensagens: 0, cliques: 0, vendas: 0 }
    },
    {
      id: 4,
      data: '2026-02-11',
      tipo: 'Lançamento',
      produto: 'Pijama Luiza - Estampa Floral',
      preco: 'R$ 94,90',
      descricao: '🌸 Novo! Pijama Luiza com estampa floral exclusiva. Perfeito para o verão. Disponível em 3 cores!',
      imagem: '🌺',
      link: 'https://feminnita.com/pijama-luiza-floral',
      status: 'Agendado',
      engajamento: { mensagens: 0, cliques: 0, vendas: 0 }
    }
  ];

  const estatisticas = {
    totalPostagens: 4,
    agendadas: 4,
    enviadas: 0,
    totalEngajamento: 0,
    totalCliques: 0,
    totalVendas: 0,
    taxaConversao: '0%'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold" style={{ color: '#A63D4A' }}>
          🤖 Automação WhatsApp VIP - Carol
        </h2>
        <p className="text-slate-600 mt-2">
          Sistema autônomo de postagens para o grupo VIP. Carol monitora Bling e dispara postagens terças e quintas.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#A63D4A' }}>
              {estatisticas.agendadas}
            </div>
            <p className="text-xs text-slate-500 mt-1">próximas 2 semanas</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Engajamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#A63D4A' }}>
              {estatisticas.totalEngajamento}
            </div>
            <p className="text-xs text-slate-500 mt-1">mensagens + cliques</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cliques em Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#A63D4A' }}>
              {estatisticas.totalCliques}
            </div>
            <p className="text-xs text-slate-500 mt-1">taxa de clique</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Vendas Geradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#A63D4A' }}>
              {estatisticas.totalVendas}
            </div>
            <p className="text-xs text-slate-500 mt-1">conversão</p>
          </CardContent>
        </Card>
      </div>

      {/* Configurações */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: '#A63D4A' }} />
            Configurações
          </CardTitle>
          <CardDescription>Ajuste os parâmetros de automação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#A63D4A' }}>
                Token WhatsApp Business
              </label>
              <Input
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
                placeholder="seu_token_aqui"
                className="border-amber-200"
              />
              <p className="text-xs text-slate-500 mt-1">Adicione seu token de acesso da API WhatsApp</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#A63D4A' }}>
                Número do Grupo VIP
              </label>
              <Input
                value={grupoVIP}
                onChange={(e) => setGrupoVIP(e.target.value)}
                placeholder="22992810707"
                className="border-amber-200"
              />
              <p className="text-xs text-slate-500 mt-1">ID do grupo WhatsApp VIP</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#A63D4A' }}>
                <Clock className="w-4 h-4 inline mr-1" />
                Horário de Disparo
              </label>
              <Input
                type="time"
                value={horarioDisparo}
                onChange={(e) => setHorarioDisparo(e.target.value)}
                className="border-amber-200"
              />
              <p className="text-xs text-slate-500 mt-1">Hora que Carol dispara as postagens</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#A63D4A' }}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Dias de Disparo
              </label>
              <div className="flex gap-2">
                {['terça', 'quinta'].map(dia => (
                  <button
                    key={dia}
                    onClick={() => {
                      setDiasDisparo(prev =>
                        prev.includes(dia)
                          ? prev.filter(d => d !== dia)
                          : [...prev, dia]
                      );
                    }}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      diasDisparo.includes(dia)
                        ? 'bg-amber-100 text-slate-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button className="w-full" style={{ backgroundColor: '#A63D4A' }}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Postagens Agendadas */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" style={{ color: '#A63D4A' }} />
            Postagens Agendadas
          </CardTitle>
          <CardDescription>Próximas postagens que Carol vai disparar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {postagens.map((post) => (
              <div
                key={post.id}
                className="p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{post.imagem}</span>
                      <h3 className="font-bold" style={{ color: '#A63D4A' }}>
                        {post.produto}
                      </h3>
                    </div>
                    <div className="flex gap-3 text-sm text-slate-600">
                      <span className="bg-amber-100 px-2 py-1 rounded">
                        {post.tipo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {horarioDisparo}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                    {post.status}
                  </span>
                </div>

                <p className="text-slate-700 mb-2">{post.descricao}</p>

                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="font-semibold" style={{ color: '#A63D4A' }}>
                    {post.preco}
                  </span>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    Ver Produto
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-200">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Mensagens</p>
                    <p className="font-bold" style={{ color: '#A63D4A' }}>
                      {post.engajamento.mensagens}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Cliques</p>
                    <p className="font-bold" style={{ color: '#A63D4A' }}>
                      {post.engajamento.cliques}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Vendas</p>
                    <p className="font-bold" style={{ color: '#A63D4A' }}>
                      {post.engajamento.vendas}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm">📋 Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-slate-700">
          <p>
            <strong>1. Monitoramento:</strong> Carol monitora Bling continuamente para detectar lançamentos, retornos e promoções
          </p>
          <p>
            <strong>2. Seleção:</strong> Cérebro da Carol escolhe qual produto postar baseado em tendências e estoque
          </p>
          <p>
            <strong>3. Geração:</strong> Carol gera texto personalizado com sua voz de 24 anos + emoji + link
          </p>
          <p>
            <strong>4. Disparo:</strong> Postagem enviada automaticamente terças e quintas às 10h para o grupo VIP
          </p>
          <p>
            <strong>5. Análise:</strong> Rastreia engajamento, cliques e vendas geradas por cada postagem
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
