import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Mail, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ExportarCalendarioSection() {
  const [exportado, setExportado] = useState(false);
  const [formato, setFormato] = useState("ical");
  const [copiado, setCopiado] = useState(false);

  const planejamentoSemanal = [
    {
      dia: "Segunda",
      data: "03/02/2026",
      tema: "Teaser + Anúncio",
      horarios: ["09:00", "13:00", "19:00"],
      tipo: "Stories",
      personas: ["Carol", "Renata"],
      descricao: "Teaser do lançamento com anúncio oficial"
    },
    {
      dia: "Terça",
      data: "04/02/2026",
      tema: "Cores + Enquete",
      horarios: ["09:00", "13:00", "19:00"],
      tipo: "Stories",
      personas: ["Vanessa"],
      descricao: "Enquete sobre cores preferidas"
    },
    {
      dia: "Quarta",
      data: "05/02/2026",
      tema: "Características + Educação",
      horarios: ["09:00", "13:00", "19:00"],
      tipo: "Stories + Reels",
      personas: ["Luiza"],
      descricao: "Educação sobre características do pijama"
    },
    {
      dia: "Quinta",
      data: "06/02/2026",
      tema: "Prova Social + Depoimentos",
      horarios: ["09:00", "13:00", "19:00"],
      tipo: "Stories + Reels",
      personas: ["Carol", "Renata", "Vanessa"],
      descricao: "Depoimentos de clientes satisfeitos"
    },
    {
      dia: "Sexta",
      data: "07/02/2026",
      tema: "Votação + Urgência",
      horarios: ["09:00", "13:00", "20:00"],
      tipo: "Stories + Ads",
      personas: ["Todas"],
      descricao: "Votação de promoção com urgência"
    },
    {
      dia: "Sábado",
      data: "08/02/2026",
      tema: "Lifestyle + Inspiração",
      horarios: ["10:00", "14:00", "20:00"],
      tipo: "Reels + Stories",
      personas: ["Luiza", "Vanessa"],
      descricao: "Conteúdo lifestyle e inspirador"
    },
    {
      dia: "Domingo",
      data: "09/02/2026",
      tema: "Fechamento + Último Chamado",
      horarios: ["11:00", "15:00", "19:00"],
      tipo: "Stories + Reels",
      personas: ["Todas"],
      descricao: "Último chamado com oferta especial"
    }
  ];

  const gerarIcal = () => {
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Feminnita//Marketing Strategy//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Feminnita - Campanha Semanal
X-WR-TIMEZONE:America/Sao_Paulo
BEGIN:VTIMEZONE
TZID:America/Sao_Paulo
BEGIN:STANDARD
DTSTART:20260101T000000
TZOFFSETFROM:-0300
TZOFFSETTO:-0300
TZNAME:BRT
END:STANDARD
END:VTIMEZONE
`;

    planejamentoSemanal.forEach((item, idx) => {
      item.horarios.forEach((horario, hIdx) => {
        const [hora, minuto] = horario.split(':');
        const dtstart = `${item.data.split('/').reverse().join('')}T${hora}${minuto}00`;
        const dtend = `${item.data.split('/').reverse().join('')}T${parseInt(hora) + 1}${minuto}00`;
        
        icalContent += `BEGIN:VEVENT
UID:feminnita-${idx}-${hIdx}@feminnita.com.br
DTSTAMP:20260131T120000Z
DTSTART;TZID=America/Sao_Paulo:${dtstart}
DTEND;TZID=America/Sao_Paulo:${dtend}
SUMMARY:${item.tema} - ${item.tipo}
DESCRIPTION:${item.descricao}\\nPersonas: ${item.personas.join(', ')}
LOCATION:Instagram / TikTok
CATEGORIES:Marketing,Social Media
END:VEVENT
`;
      });
    });

    icalContent += `END:VCALENDAR`;
    return icalContent;
  };

  const gerarCSV = () => {
    let csvContent = "Dia,Data,Tema,Horário,Tipo,Personas,Descrição\n";
    
    planejamentoSemanal.forEach((item) => {
      item.horarios.forEach((horario) => {
        csvContent += `"${item.dia}","${item.data}","${item.tema}","${horario}","${item.tipo}","${item.personas.join('; ')}","${item.descricao}"\n`;
      });
    });

    return csvContent;
  };

  const exportarCalendario = () => {
    let conteudo = "";
    let nomeArquivo = "";
    let tipo = "";

    if (formato === "ical") {
      conteudo = gerarIcal();
      nomeArquivo = `Feminnita_Calendario_${new Date().getTime()}.ics`;
      tipo = "text/calendar";
    } else if (formato === "csv") {
      conteudo = gerarCSV();
      nomeArquivo = `Feminnita_Calendario_${new Date().getTime()}.csv`;
      tipo = "text/csv";
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:' + tipo + ';charset=utf-8,' + encodeURIComponent(conteudo));
    element.setAttribute('download', nomeArquivo);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setExportado(true);
    setTimeout(() => setExportado(false), 2000);
  };

  const copiarParaClipboard = () => {
    const texto = planejamentoSemanal.map(item => 
      `${item.dia} (${item.data}): ${item.tema} - ${item.tipo} às ${item.horarios.join(', ')}`
    ).join('\n');
    
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Exportar Calendário de Postagens</h2>
        <p className="text-slate-600">
          Exporte seu planejamento semanal em múltiplos formatos para integrar com suas ferramentas de produtividade.
        </p>
      </div>

      {/* Opções de Exportação */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Escolha o Formato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { 
                id: "ical", 
                nome: "iCalendar (.ics)", 
                descricao: "Para Google Calendar, Outlook, Apple Calendar",
                icon: "📅"
              },
              { 
                id: "csv", 
                nome: "Excel/CSV (.csv)", 
                descricao: "Para Excel, Sheets, Notion",
                icon: "📊"
              },
              { 
                id: "texto", 
                nome: "Copiar para Clipboard", 
                descricao: "Copie e cole em qualquer lugar",
                icon: "📋"
              }
            ].map((opt) => (
              <Button
                key={opt.id}
                variant={formato === opt.id ? "default" : "outline"}
                onClick={() => setFormato(opt.id)}
                className="h-auto py-4 flex flex-col items-start justify-start"
              >
                <span className="text-2xl mb-2">{opt.icon}</span>
                <span className="font-semibold text-sm">{opt.nome}</span>
                <span className="text-xs opacity-75 text-left">{opt.descricao}</span>
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t border-blue-200">
            <Button 
              onClick={formato === "texto" ? copiarParaClipboard : exportarCalendario}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              size="lg"
            >
              {formato === "texto" ? (
                <>
                  <Copy className="w-5 h-5" />
                  {copiado ? "✅ Copiado!" : "Copiar para Clipboard"}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {exportado ? "✅ Exportado!" : "Exportar Calendário"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualização do Calendário */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendário da Semana</CardTitle>
          <CardDescription>Visualização do planejamento semanal completo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planejamentoSemanal.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.dia}</h4>
                    <p className="text-sm text-slate-600">{item.data}</p>
                  </div>
                  <Badge variant="secondary">{item.tipo}</Badge>
                </div>
                
                <p className="font-semibold text-slate-900 mb-2">{item.tema}</p>
                <p className="text-sm text-slate-700 mb-3">{item.descricao}</p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.personas.map((persona, pIdx) => (
                    <Badge key={pIdx} variant="outline" className="text-xs">
                      {persona}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 text-xs text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Horários: {item.horarios.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruções por Formato */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar Cada Formato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">📅 iCalendar (.ics)</h4>
            <ol className="space-y-1 text-slate-700 list-decimal list-inside">
              <li>Exporte o arquivo .ics</li>
              <li>Abra Google Calendar, Outlook ou Apple Calendar</li>
              <li>Clique em "Importar" ou "Adicionar calendário"</li>
              <li>Selecione o arquivo baixado</li>
              <li>Todos os eventos aparecerão automaticamente!</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">📊 Excel/CSV (.csv)</h4>
            <ol className="space-y-1 text-slate-700 list-decimal list-inside">
              <li>Exporte o arquivo .csv</li>
              <li>Abra em Excel, Google Sheets ou Notion</li>
              <li>Customize conforme necessário</li>
              <li>Compartilhe com sua equipe</li>
              <li>Atualize em tempo real!</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">📋 Copiar para Clipboard</h4>
            <ol className="space-y-1 text-slate-700 list-decimal list-inside">
              <li>Clique em "Copiar para Clipboard"</li>
              <li>Cole em qualquer lugar (email, Slack, Notion, etc)</li>
              <li>Perfeito para compartilhamento rápido</li>
              <li>Formato legível e organizado</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios da Exportação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "✅ Sincronize com Google Calendar, Outlook ou Apple Calendar",
            "✅ Compartilhe facilmente com sua equipe",
            "✅ Receba lembretes automáticos para cada postagem",
            "✅ Organize melhor seu tempo e tarefas",
            "✅ Integre com ferramentas de produtividade (Notion, Asana, etc)",
            "✅ Acesse o calendário offline",
            "✅ Colabore em tempo real com sua equipe",
            "✅ Nunca mais perca uma postagem programada"
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
          <p>1. 📥 Exporte o calendário no formato de sua preferência</p>
          <p>2. 📱 Importe em seu aplicativo de calendário favorito</p>
          <p>3. 🔔 Configure lembretes para cada postagem</p>
          <p>4. 👥 Compartilhe com sua equipe</p>
          <p>5. ✅ Marque como concluído conforme publica</p>
          <p>6. 📊 Acompanhe performance de cada postagem</p>
        </CardContent>
      </Card>
    </div>
  );
}
