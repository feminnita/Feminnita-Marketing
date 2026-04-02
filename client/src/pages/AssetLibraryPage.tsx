import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImageIcon, Plus, Trash2, Folder, Zap, Upload, Package } from "lucide-react";

type AssetCategory =
  | "all"
  | "produto"
  | "lifestyle"
  | "modelo"
  | "colecao"
  | "background"
  | "logo"
  | "outro";

const CATEGORY_LABELS: Record<string, string> = {
  all: "Todas",
  produto: "Produto",
  lifestyle: "Lifestyle",
  modelo: "Modelo",
  colecao: "Coleção",
  background: "Background",
  logo: "Logo",
  outro: "Outro",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-gray-100 text-gray-600" },
  ativo: { label: "Ativo", className: "bg-green-100 text-green-700" },
  arquivado: { label: "Arquivado", className: "bg-orange-100 text-orange-700" },
};

export default function AssetLibraryPage() {
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory>("all");
  const [newImageOpen, setNewImageOpen] = useState(false);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(null);

  // Form states — nova imagem
  const [imgUrl, setImgUrl] = useState("");
  const [imgName, setImgName] = useState("");
  const [imgDescription, setImgDescription] = useState("");
  const [imgCategory, setImgCategory] = useState("");
  const [imgPlatform, setImgPlatform] = useState("");
  const [imgTags, setImgTags] = useState("");

  // Form states — nova coleção
  const [colName, setColName] = useState("");
  const [colDescription, setColDescription] = useState("");
  const [colType, setColType] = useState("");
  const [colSeason, setColSeason] = useState("");
  const [colAssetIds, setColAssetIds] = useState<number[]>([]);

  const { data: assets, refetch: refetchAssets } =
    trpc.assetLibrary.listAssets.useQuery({});
  const { data: collections, refetch: refetchCollections } =
    trpc.assetLibrary.listCollections.useQuery();

  const uploadAsset = trpc.assetLibrary.uploadAsset.useMutation({
    onSuccess: () => {
      refetchAssets();
      setNewImageOpen(false);
      resetImageForm();
    },
  });

  const deleteAsset = trpc.assetLibrary.deleteAsset.useMutation({
    onSuccess: () => refetchAssets(),
  });

  const createCollection = trpc.assetLibrary.createCollection.useMutation({
    onSuccess: () => {
      refetchCollections();
      setNewCollectionOpen(false);
      resetCollectionForm();
    },
  });

  const activateCollection = trpc.assetLibrary.activateCollection.useMutation({
    onSuccess: (data) => {
      refetchCollections();
      const briefCount =
        typeof data === "object" && data !== null && "briefsCreated" in data
          ? (data as { briefsCreated: number }).briefsCreated
          : 0;
      setActivationMessage(
        `Coleção ativada! ${briefCount > 0 ? `${briefCount} brief(s) criado(s). ` : ""}Os agentes de IA vão gerar o conteúdo automaticamente em alguns minutos.`
      );
      setTimeout(() => setActivationMessage(null), 6000);
    },
  });

  function resetImageForm() {
    setImgUrl("");
    setImgName("");
    setImgDescription("");
    setImgCategory("");
    setImgPlatform("");
    setImgTags("");
  }

  function resetCollectionForm() {
    setColName("");
    setColDescription("");
    setColType("");
    setColSeason("");
    setColAssetIds([]);
  }

  function handleUploadAsset() {
    uploadAsset.mutate({
      url: imgUrl,
      name: imgName,
      description: imgDescription,
      category: imgCategory as "produto" | "lifestyle" | "modelo" | "colecao" | "background" | "logo" | "outro",
      platform: imgPlatform as "instagram" | "tiktok" | "todos",
      tags: imgTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  function handleCreateCollection() {
    createCollection.mutate({
      name: colName,
      description: colDescription,
      collectionType: colType as "produto" | "colecao" | "campanha" | "temporada",
      season: colSeason,
      assetIds: colAssetIds,
    });
  }

  function toggleAssetSelection(id: number) {
    setColAssetIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  const filteredAssets =
    assets?.filter(
      (a: { category?: string }) =>
        categoryFilter === "all" || a.category === categoryFilter
    ) ?? [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-500" />
            Banco de Imagens
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Gerencie assets visuais e coleções para os agentes de IA.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newImageOpen} onOpenChange={setNewImageOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Nova Imagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Imagem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>URL da Imagem</Label>
                  <Input
                    placeholder="https://..."
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Nome</Label>
                  <Input
                    placeholder="Ex: Pijama Floral Verão 2026"
                    value={imgName}
                    onChange={(e) => setImgName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva a imagem..."
                    value={imgDescription}
                    onChange={(e) => setImgDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={imgCategory} onValueChange={setImgCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="modelo">Modelo</SelectItem>
                        <SelectItem value="colecao">Coleção</SelectItem>
                        <SelectItem value="background">Background</SelectItem>
                        <SelectItem value="logo">Logo</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Plataforma</Label>
                    <Select value={imgPlatform} onValueChange={setImgPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input
                    placeholder="pijama, verão, floral, conforto"
                    value={imgTags}
                    onChange={(e) => setImgTags(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleUploadAsset}
                  disabled={uploadAsset.isPending || !imgUrl || !imgName}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {uploadAsset.isPending ? "Adicionando..." : "Adicionar Imagem"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                <Folder className="w-4 h-4" />
                Nova Coleção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Coleção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Nome da Coleção</Label>
                  <Input
                    placeholder="Ex: Verão 2026 - Florais"
                    value={colName}
                    onChange={(e) => setColName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva a coleção..."
                    value={colDescription}
                    onChange={(e) => setColDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={colType} onValueChange={setColType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="colecao">Coleção</SelectItem>
                        <SelectItem value="campanha">Campanha</SelectItem>
                        <SelectItem value="temporada">Temporada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Temporada</Label>
                    <Input
                      placeholder="Ex: Verão 2026"
                      value={colSeason}
                      onChange={(e) => setColSeason(e.target.value)}
                    />
                  </div>
                </div>
                {assets && assets.length > 0 && (
                  <div>
                    <Label>Assets da Coleção</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Clique para selecionar/desselecionar
                    </p>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {assets.map((a: { id: number; name: string; category?: string }) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAssetSelection(a.id)}
                          className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                            colAssetIds.includes(a.id)
                              ? "bg-pink-50 border border-pink-300 text-pink-700"
                              : "hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          {a.name}
                          {a.category && (
                            <span className="ml-2 text-xs text-gray-400">
                              ({a.category})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {colAssetIds.length} selecionado(s)
                    </p>
                  </div>
                )}
                <Button
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  onClick={handleCreateCollection}
                  disabled={createCollection.isPending || !colName}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {createCollection.isPending ? "Criando..." : "Criar Coleção"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Toast de ativação */}
      {activationMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-green-600 text-lg">✅</span>
          <p className="text-green-800 text-sm">{activationMessage}</p>
        </div>
      )}

      <Tabs defaultValue="imagens">
        <TabsList>
          <TabsTrigger value="imagens" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Imagens
            {assets && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {assets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="colecoes" className="gap-2">
            <Folder className="w-4 h-4" />
            Coleções
            {collections && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {collections.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ABA IMAGENS */}
        <TabsContent value="imagens" className="mt-4 space-y-4">
          {/* Filtro de categoria */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                  categoryFilter === cat
                    ? "bg-pink-600 text-white border-pink-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {filteredAssets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma imagem encontrada.</p>
              <p className="text-sm mt-1">Adicione a primeira imagem ao banco.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAssets.map(
                (asset) => (
                  <Card
                    key={asset.id}
                    className="overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {asset.thumbnailUrl || asset.url ? (
                        <img
                          src={asset.thumbnailUrl ?? asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      <button
                        onClick={() => deleteAsset.mutate({ id: asset.id })}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500"
                        title="Deletar asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium text-gray-800 truncate">{asset.name}</p>
                      {asset.category && (
                        <Badge
                          variant="secondary"
                          className="text-xs mt-1 capitalize"
                        >
                          {asset.category}
                        </Badge>
                      )}
                      {asset.aiAnalysis && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {asset.aiAnalysis}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </TabsContent>

        {/* ABA COLEÇÕES */}
        <TabsContent value="colecoes" className="mt-4">
          {!collections || collections.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma coleção criada.</p>
              <p className="text-sm mt-1">Crie a primeira coleção para os agentes de IA.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map(
                (col) => {
                  const statusInfo =
                    STATUS_BADGE[col.status ?? "rascunho"] ??
                    STATUS_BADGE["rascunho"];
                  return (
                    <Card key={col.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-pink-50 rounded-lg shrink-0">
                            <Folder className="w-5 h-5 text-pink-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 text-sm">
                                {col.name}
                              </p>
                              <Badge className={`text-xs ${statusInfo.className}`}>
                                {statusInfo.label}
                              </Badge>
                              {col.collectionType && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {col.collectionType}
                                </Badge>
                              )}
                              {col.season && (
                                <span className="text-xs text-gray-400">
                                  {col.season}
                                </span>
                              )}
                            </div>
                            {col.description && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {col.description}
                              </p>
                            )}
                            {typeof col.briefsGenerated === "number" && (
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {col.briefsGenerated} brief(s) gerado(s)
                              </p>
                            )}
                          </div>
                        </div>
                        {col.status === "rascunho" && (
                          <Button
                            size="sm"
                            className="shrink-0 bg-green-600 hover:bg-green-700 gap-1"
                            onClick={() =>
                              activateCollection.mutate({ id: col.id })
                            }
                            disabled={activateCollection.isPending}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Ativar
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
