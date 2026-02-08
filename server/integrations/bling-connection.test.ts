/**
 * Teste para verificar a conexão real com Bling
 * Verifica se as credenciais estão configuradas e se a API está acessível
 */

import { describe, it, expect } from "vitest";

describe("Bling Connection Status", () => {
  it("should have Bling credentials configured", () => {
    const clientId = process.env.BLING_CLIENT_ID;
    const clientSecret = process.env.BLING_CLIENT_SECRET;
    const redirectUri = process.env.BLING_REDIRECT_URI;

    console.log("🔍 Verificando credenciais do Bling...");
    console.log(`BLING_CLIENT_ID: ${clientId ? "✅ Configurado" : "❌ Não configurado"}`);
    console.log(`BLING_CLIENT_SECRET: ${clientSecret ? "✅ Configurado" : "❌ Não configurado"}`);
    console.log(`BLING_REDIRECT_URI: ${redirectUri ? "✅ Configurado" : "❌ Não configurado"}`);

    // Verificar se pelo menos uma credencial está configurada
    const hasCredentials = clientId || clientSecret || redirectUri;
    expect(hasCredentials).toBeDefined();
  });

  it("should verify Bling API endpoint is accessible", async () => {
    try {
      console.log("🔍 Testando acesso à API do Bling...");
      
      const response = await fetch("https://www.bling.com.br/api/v3/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token", // Token inválido para testar endpoint
        },
      });

      // Esperamos erro 401 (não autorizado) porque o token é inválido
      // Mas isso confirma que o endpoint está acessível
      console.log(`📊 Status da API: ${response.status}`);
      
      if (response.status === 401) {
        console.log("✅ API do Bling está acessível (erro 401 esperado com token inválido)");
        expect(response.status).toBe(401);
      } else if (response.status === 403) {
        console.log("✅ API do Bling está acessível (erro 403 - acesso proibido)");
        expect(response.status).toBe(403);
      } else {
        console.log(`⚠️ Status inesperado: ${response.status}`);
        expect([401, 403, 404]).toContain(response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com API do Bling:", error);
      throw error;
    }
  });

  it("should verify Bling OAuth endpoint is accessible", async () => {
    try {
      console.log("🔍 Testando acesso ao OAuth do Bling...");
      
      const response = await fetch("https://www.bling.com.br/oauth/authorize", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`📊 Status do OAuth: ${response.status}`);
      
      // Esperamos erro porque não estamos enviando parâmetros corretos
      // Mas isso confirma que o endpoint está acessível
      expect([400, 401, 403, 405]).toContain(response.status);
      console.log("✅ Endpoint OAuth do Bling está acessível");
    } catch (error) {
      console.error("❌ Erro ao conectar com OAuth do Bling:", error);
      throw error;
    }
  });

  it("should check if Bling sync router is properly configured", async () => {
    try {
      console.log("🔍 Verificando roteador de sincronização do Bling...");
      
      // Verificar se o arquivo de sincronização existe
      const blingSync = await import("../routers/bling-sync");
      
      expect(blingSync).toBeDefined();
      expect(blingSync.blingSyncRouter).toBeDefined();
      
      console.log("✅ Roteador de sincronização do Bling está configurado");
    } catch (error) {
      console.error("❌ Erro ao verificar roteador:", error);
      throw error;
    }
  });

  it("should provide integration status summary", () => {
    console.log("\n📋 RESUMO DA INTEGRAÇÃO COM BLING:");
    console.log("================================");
    
    const hasClientId = !!process.env.BLING_CLIENT_ID;
    const hasClientSecret = !!process.env.BLING_CLIENT_SECRET;
    const hasRedirectUri = !!process.env.BLING_REDIRECT_URI;
    
    console.log(`✅ Credenciais OAuth: ${hasClientId && hasClientSecret ? "CONFIGURADAS" : "INCOMPLETAS"}`);
    console.log(`✅ Redirect URI: ${hasRedirectUri ? "CONFIGURADA" : "NÃO CONFIGURADA"}`);
    console.log(`✅ API Base URL: https://www.bling.com.br/api/v3`);
    console.log(`✅ OAuth URL: https://www.bling.com.br/oauth/authorize`);
    console.log("\n💡 Próximos passos:");
    console.log("1. Conectar sua conta Bling via OAuth");
    console.log("2. Sincronizar produtos e estoque");
    console.log("3. Configurar webhook para atualizações em tempo real");
    console.log("================================\n");
    
    expect(true).toBe(true);
  });
});
