import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Users, Search, Phone, Mail, RefreshCw, Loader2, Link2, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BlingContato = {
  id?: number | string;
  nome?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  tipo?: string;
  situacao?: string | number;
  [key: string]: unknown;
};

export function CRMClientesSection() {
  const [search, setSearch] = useState("");
  const [contatos, setContatos] = useState<BlingContato[]>([]);
  const [synced, setSynced] = useState(false);

  const { data: status } = trpc.blingOAuth.getStatus.useQuery();
  const sync = trpc.bling.sincronizarContatos.useMutation({
    onSuccess: (data: any) => {
      setContatos(data.contatos ?? []);
      setSynced(true);
    },
  });

  const filtered = contatos.filter((c: BlingContato) => {
    const q = search.toLowerCase();
    return !q || (c.nome ?? "").toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q);
  });

  const totalAtivos = contatos.filter((c: BlingContato) => c.situacao === 1 || c.situacao === "Ativo").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>CRM de Clientes</h2>
          <p className="text-slate-500 text-sm mt-1">Contatos sincronizados do Bling ERP.</p>
        </div>
        {status?.conectado && !status.expirado && (
          <Button style={{ backgroundColor: '#8B2635' }} className="text-white"
            disabled={sync.isPending}
            onClick={() => sync.mutate({})}>
            {sync.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sincronizando...</>
              : <><RefreshCw className="w-4 h-4 mr-2" />Carregar do Bling</>
            }
          </Button>
        )}
      </div>

      {/* Bling not connected */}
      {!status?.conectado && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Link2 className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Bling não conectado</p>
                <p className="text-sm text-slate-500 mt-1">
                  Conecte o Bling ERP na aba <strong>Integrações → Bling ERP</strong> para carregar sua base de clientes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {synced && contatos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <p className="text-2xl font-bold" style={{ color: '#8B2635' }}>{contatos.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total de contatos</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <p className="text-2xl font-bold text-green-600">{totalAtivos}</p>
              <p className="text-xs text-slate-500 mt-1">Contatos ativos</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <p className="text-2xl font-bold text-blue-600">
                {contatos.filter((c: BlingContato) => c.email).length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Com email</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search + List */}
      {synced && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input placeholder="Buscar por nome ou email..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <UserCheck className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Nenhum contato encontrado.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filtered.slice(0, 100).map((c: BlingContato, i: number) => (
                  <div key={(c.id as string) ?? i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: '#8B2635' }}>
                      {(c.nome ?? "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{c.nome ?? "Sem nome"}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        {c.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />{c.email}
                          </span>
                        )}
                        {(c.telefone || c.celular) && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />{c.telefone ?? c.celular}
                          </span>
                        )}
                      </div>
                    </div>
                    {c.tipo && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{c.tipo as string}</Badge>
                    )}
                  </div>
                ))}
                {filtered.length > 100 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Mostrando 100 de {filtered.length} contatos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Not yet synced but connected */}
      {status?.conectado && !status.expirado && !synced && !sync.isPending && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">Clique em <strong>Carregar do Bling</strong> para importar seus contatos.</p>
        </div>
      )}

      {sync.isError && (
        <p className="text-sm text-red-500 text-center">
          Erro ao sincronizar contatos. Verifique a conexão com o Bling.
        </p>
      )}
    </div>
  );
}
