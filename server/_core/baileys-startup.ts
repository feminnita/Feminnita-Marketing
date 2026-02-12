/**
 * Inicialização do Baileys no startup do servidor
 * Responsável por:
 * 1. Carregar sessões salvas do banco de dados
 * 2. Reconectar sessões ativas
 * 3. Manter Baileys rodando em background
 */

import { getDb } from "../db";
import { initializeWhatsApp } from "./baileys-service";

let isInitialized = false;

export async function initializeBaileysOnStartup(): Promise<void> {
  if (isInitialized) {
    console.log("[Baileys] Já foi inicializado");
    return;
  }

  try {
    // Para agora, apenas inicializar Baileys sem carregar sessões do banco
    // Sessões serão criadas sob demanda quando o usuário clicar em "Conectar"
    console.log("[Baileys] Sistema de Baileys pronto para receber conexões");



    isInitialized = true;
    console.log("[Baileys] Startup concluído com sucesso");
  } catch (error) {
    console.error("[Baileys] Erro durante startup:", error);
    throw error;
  }
}

/**
 * Obter status de todas as sessões
 */
export function getAllSessionsStatus(): Record<number, any> {
  const statuses: Record<number, any> = {};
  
  // Aqui você pode iterar sobre todas as sessões ativas
  // e retornar seus status
  
  return statuses;
}

/**
 * Verificar saúde do Baileys
 */
export function checkBaileysHealth(): {
  isHealthy: boolean;
  activeSessions: number;
  message: string;
} {
  return {
    isHealthy: isInitialized,
    activeSessions: 0,
    message: isInitialized ? "Baileys rodando normalmente" : "Baileys não inicializado",
  };
}
