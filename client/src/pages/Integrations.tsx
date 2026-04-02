
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Integrations() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integrações de Plataformas</h1>
        <p className="text-gray-600 mt-2">Conecte suas contas de diferentes plataformas para automação completa</p>
      </div>

      {/* Bling Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🔗 Bling ERP</span>
                <Badge className="bg-yellow-500">Em Breve</Badge>
              </CardTitle>
              <CardDescription>Sincronize produtos, pedidos e estoque</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Integração em desenvolvimento</p>
                <p className="text-sm text-yellow-700">A integração com Bling está sendo configurada. Em breve você poderá conectar sua conta.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canva Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🎨 Canva</span>
                <Badge className="bg-yellow-500">Em Breve</Badge>
              </CardTitle>
              <CardDescription>Crie designs automaticamente para posts e stories</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Integração em desenvolvimento</p>
                <p className="text-sm text-yellow-700">A integração com Canva está sendo configurada. Em breve você poderá conectar sua conta.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>📱 Meta (Facebook & Instagram)</span>
                <Badge className="bg-yellow-500">Em Breve</Badge>
              </CardTitle>
              <CardDescription>Gerencie campanhas de anúncios e posts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Integração em desenvolvimento</p>
                <p className="text-sm text-yellow-700">A integração com Meta está sendo configurada. Em breve você poderá conectar sua conta.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TikTok Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🎵 TikTok</span>
                <Badge className="bg-yellow-500">Em Breve</Badge>
              </CardTitle>
              <CardDescription>Gerencie sua conta e campanhas do TikTok</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Integração em desenvolvimento</p>
                <p className="text-sm text-yellow-700">A integração com TikTok está sendo configurada. Em breve você poderá conectar sua conta.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>📁 Google Drive</span>
                <Badge className="bg-yellow-500">Em Breve</Badge>
              </CardTitle>
              <CardDescription>Sincronize arquivos e documentos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Integração em desenvolvimento</p>
                <p className="text-sm text-yellow-700">A integração com Google Drive está sendo configurada. Em breve você poderá conectar sua conta.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
