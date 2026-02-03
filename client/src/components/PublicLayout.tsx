/**
 * Layout para páginas públicas (sem autenticação necessária)
 * Usado para Termos, Privacidade, etc
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
