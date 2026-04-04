import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

const ACCENT_COLORS = ['#8B2635', '#A63D4A', '#6B7A3A', '#3A5A6B'];
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarioConteudoSection() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formNote, setFormNote] = useState('');

  const { data: influencers = [] } = trpc.influencers.list.useQuery();
  const { data: allPosts = [], isLoading, refetch } = trpc.influencers.getAllPosts.useQuery({ limit: 500 });
  type Inf = (typeof influencers)[number];
  type PostItem = (typeof allPosts)[number];

  // Map influencer id → color index
  const influencerColorMap: Record<number, number> = {};
  influencers.forEach((inf: Inf, idx: number) => { influencerColorMap[inf.id] = idx; });

  // Group posts by day of current month
  const postsByDay: Record<number, typeof allPosts> = {};
  allPosts.forEach((post: PostItem) => {
    const dateStr = post.scheduledAt ?? post.createdAt;
    if (!dateStr) return;
    const d = new Date(dateStr as string);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthPosts = allPosts.filter((post: PostItem) => {
    const d = new Date((post.scheduledAt ?? post.createdAt) as string);
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort((a: PostItem, b: PostItem) =>
    new Date((a.scheduledAt ?? a.createdAt) as string).getTime() -
    new Date((b.scheduledAt ?? b.createdAt) as string).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Calendário de Conteúdo</h2>
          <p className="text-slate-500 text-sm mt-1">Posts de todas as influencers. Cada cor é uma persona.</p>
        </div>
      </div>

      {/* Legenda */}
      {influencers.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {influencers.map((inf: Inf, idx: number) => (
            <div key={inf.id} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }} />
              <span className="text-xs text-slate-600">{inf.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calendário */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <h3 className="font-semibold text-slate-800">{MONTHS_PT[month]} {year}</h3>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B2635' }} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-2">
                {WEEK_DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`e-${idx}`} />;
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const dayPosts = postsByDay[day] ?? [];
                  return (
                    <div key={day}
                      className={`min-h-[60px] rounded-lg p-1 border transition-colors ${isToday ? 'border-current' : 'border-transparent hover:border-slate-200'}`}
                      style={isToday ? { borderColor: '#8B2635' } : {}}
                    >
                      <div className={`text-xs font-medium mb-1 w-5 h-5 rounded-full flex items-center justify-center ${isToday ? 'text-white' : 'text-slate-600'}`}
                        style={isToday ? { backgroundColor: '#8B2635' } : {}}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayPosts.slice(0, 3).map((post: PostItem, pi: number) => {
                          const colorIdx = influencerColorMap[post.influencerId ?? 0] ?? 0;
                          return (
                            <div key={pi}
                              className="rounded text-[10px] px-1 py-0.5 truncate text-white"
                              style={{ backgroundColor: ACCENT_COLORS[colorIdx % ACCENT_COLORS.length] }}
                              title={`${post.influencerName}: ${post.caption ?? ''}`}>
                              {post.influencerName}
                            </div>
                          );
                        })}
                        {dayPosts.length > 3 && <div className="text-[10px] text-slate-400 pl-1">+{dayPosts.length - 3}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista do mês */}
      {monthPosts.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Posts de {MONTHS_PT[month]} <Badge variant="secondary" className="ml-1">{monthPosts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {monthPosts.map((post: PostItem) => {
                const colorIdx = influencerColorMap[post.influencerId ?? 0] ?? 0;
                const d = new Date((post.scheduledAt ?? post.createdAt) as string);
                return (
                  <div key={post.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: ACCENT_COLORS[colorIdx % ACCENT_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium" style={{ color: ACCENT_COLORS[colorIdx % ACCENT_COLORS.length] }}>
                          {post.influencerName}
                        </span>
                        {post.platform && <span className="text-xs text-slate-400">{post.platform}</span>}
                        <Badge className={`text-xs border-0 ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'}`}>
                          {post.status === 'published' ? 'Publicado' : post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                        </Badge>
                      </div>
                      {post.caption && <p className="text-xs text-slate-600 truncate mt-0.5">{post.caption}</p>}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && allPosts.length === 0 && influencers.length > 0 && (
        <div className="text-center py-8 text-slate-400">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum post ainda. Gere conteúdo em <strong>Influencers</strong> ou <strong>Gerar Conteúdo</strong>.</p>
        </div>
      )}

      {influencers.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">Crie as influencers em <strong>Personas</strong> primeiro.</p>
        </div>
      )}
    </div>
  );
}
