import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-lg hover:opacity-80">
              <span style={{ color: "#A63D4A" }}>Feminnita</span>
            </a>
          </Link>
          <Button onClick={() => (window.location.href = getLoginUrl())} variant="default">
            Entrar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Feminnita</h3>
              <p className="text-sm text-muted-foreground">
                Plataforma de marketing digital para pijamas em atacado
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/">
                    <a className="text-muted-foreground hover:text-foreground">Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/termos">
                    <a className="text-muted-foreground hover:text-foreground">Termos</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade">
                    <a className="text-muted-foreground hover:text-foreground">Privacidade</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.feminnita.com.br" className="text-muted-foreground hover:text-foreground">
                    Site Principal
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/termos">
                    <a className="text-muted-foreground hover:text-foreground">Termos de Serviço</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade">
                    <a className="text-muted-foreground hover:text-foreground">Política de Privacidade</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground text-center">
              © 2026 Feminnita. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
