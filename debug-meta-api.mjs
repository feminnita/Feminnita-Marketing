#!/usr/bin/env node

/**
 * Script de debug para testar a API do Meta diretamente
 * Uso: node debug-meta-api.mjs
 */

import dotenv from 'dotenv';
dotenv.config();

const META_GRAPH_URL = "https://graph.facebook.com/v24.0";

async function testMetaAPI() {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;

  console.log("=== DEBUG META API ===\n");
  console.log("📋 Configuração:");
  console.log(`  Token: ${accessToken ? "✅ Presente" : "❌ Ausente"}`);
  console.log(`  Account ID (raw): ${accountId}`);
  console.log(`  Account ID (formatado): act_${accountId}`);
  console.log("");

  if (!accessToken || !accountId) {
    console.error("❌ Credenciais não configuradas!");
    process.exit(1);
  }

  try {
    // Teste 1: Validar token
    console.log("🧪 Teste 1: Validando token...");
    const tokenTestUrl = `${META_GRAPH_URL}/me?access_token=${accessToken}`;
    const tokenResponse = await fetch(tokenTestUrl);
    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      console.log("✅ Token válido!");
      console.log(`   ID: ${tokenData.id}`);
      console.log(`   Name: ${tokenData.name}`);
    } else {
      console.error("❌ Token inválido!");
      console.error(`   Erro: ${tokenData.error?.message}`);
      process.exit(1);
    }

    console.log("");

    // Teste 2: Obter campanhas
    console.log("🧪 Teste 2: Obtendo campanhas...");
    const campaignsUrl = `${META_GRAPH_URL}/act_${accountId}/campaigns?fields=id,name,status,objective,created_time&access_token=${accessToken}`;
    console.log(`   URL: ${campaignsUrl.replace(accessToken, "TOKEN_HIDDEN")}`);

    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();

    if (campaignsResponse.ok) {
      console.log("✅ Campanhas obtidas com sucesso!");
      console.log(`   Total: ${campaignsData.data?.length || 0}`);
      if (campaignsData.data && campaignsData.data.length > 0) {
        console.log("   Primeiras 3 campanhas:");
        campaignsData.data.slice(0, 3).forEach((campaign, i) => {
          console.log(`     ${i + 1}. ${campaign.name} (${campaign.status})`);
        });
      }
    } else {
      console.error("❌ Erro ao obter campanhas!");
      console.error(`   Status: ${campaignsResponse.status}`);
      console.error(`   Erro: ${campaignsData.error?.message}`);
      console.error(`   Tipo: ${campaignsData.error?.type}`);
      console.error(`   Código: ${campaignsData.error?.code}`);
    }

    console.log("");

    // Teste 3: Verificar permissões do token
    console.log("🧪 Teste 3: Verificando permissões do token...");
    const permissionsUrl = `${META_GRAPH_URL}/me/permissions?access_token=${accessToken}`;
    const permissionsResponse = await fetch(permissionsUrl);
    const permissionsData = await permissionsResponse.json();

    if (permissionsResponse.ok) {
      console.log("✅ Permissões do token:");
      const permissions = permissionsData.data?.[0]?.permission || [];
      const requiredPerms = ["ads_read", "ads_management"];
      requiredPerms.forEach(perm => {
        const hasPermission = permissions.includes(perm);
        console.log(`   ${hasPermission ? "✅" : "❌"} ${perm}`);
      });
    } else {
      console.error("❌ Erro ao verificar permissões!");
      console.error(`   Erro: ${permissionsData.error?.message}`);
    }

    console.log("");
    console.log("=== FIM DO DEBUG ===");
  } catch (error) {
    console.error("❌ Erro durante o teste:", error.message);
    process.exit(1);
  }
}

testMetaAPI();
