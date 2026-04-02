/**
 * Schema Drizzle para armazenar dados de integração Bling
 * Adicione estas tabelas ao seu schema.ts principal
 */

import { mysqlTable, varchar, int, decimal, text, datetime, boolean, json, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============ CREDENCIAIS BLING ============

export const blingCredentials = mysqlTable(
  "bling_credentials",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 }).notNull().unique(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: datetime("expires_at").notNull(),
    scope: varchar("scope", { length: 255 }),
    createdAt: datetime("created_at").$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at").$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("bling_credentials_user_id_idx").on(table.userId),
  })
);

// ============ PRODUTOS SINCRONIZADOS ============

export const blingProdutos = mysqlTable(
  "bling_produtos",
  {
    id: int("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    nome: varchar("nome", { length: 255 }).notNull(),
    descricao: text("descricao"),
    sku: varchar("sku", { length: 100 }).notNull(),
    preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
    precoCusto: decimal("preco_custo", { precision: 10, scale: 2 }),
    estoque: int("estoque").notNull().default(0),
    ativo: boolean("ativo").notNull().default(true),
    categoria: varchar("categoria", { length: 255 }),
    peso: decimal("peso", { precision: 8, scale: 3 }),
    dimensoes: json("dimensoes"),
    imagens: json("imagens"),
    dataAtualizacao: datetime("data_atualizacao"),
    sincronizadoEm: datetime("sincronizado_em").$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("bling_produtos_user_id_idx").on(table.userId),
    skuIdx: index("bling_produtos_sku_idx").on(table.sku),
  })
);

// ============ PEDIDOS SINCRONIZADOS ============

export const blingPedidos = mysqlTable(
  "bling_pedidos",
  {
    id: int("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    numero: varchar("numero", { length: 100 }).notNull(),
    numeroLoja: varchar("numero_loja", { length: 100 }),
    dataEmissao: datetime("data_emissao").notNull(),
    dataEntrega: datetime("data_entrega"),
    clienteId: int("cliente_id"),
    clienteNome: varchar("cliente_nome", { length: 255 }),
    clienteEmail: varchar("cliente_email", { length: 255 }),
    clienteTelefone: varchar("cliente_telefone", { length: 20 }),
    total: decimal("total", { precision: 12, scale: 2 }).notNull(),
    desconto: decimal("desconto", { precision: 10, scale: 2 }),
    frete: decimal("frete", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 50 }).notNull(),
    observacoes: text("observacoes"),
    rastreamento: varchar("rastreamento", { length: 255 }),
    itens: json("itens"),
    dataAtualizacao: datetime("data_atualizacao"),
    sincronizadoEm: datetime("sincronizado_em").$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("bling_pedidos_user_id_idx").on(table.userId),
    numeroIdx: index("bling_pedidos_numero_idx").on(table.numero),
    statusIdx: index("bling_pedidos_status_idx").on(table.status),
  })
);

// ============ CONTATOS SINCRONIZADOS ============

export const blingContatos = mysqlTable(
  "bling_contatos",
  {
    id: int("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    nome: varchar("nome", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    telefone: varchar("telefone", { length: 20 }),
    celular: varchar("celular", { length: 20 }),
    cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
    tipo: varchar("tipo", { length: 50 }).notNull(),
    endereco: json("endereco"),
    dataAtualizacao: datetime("data_atualizacao"),
    sincronizadoEm: datetime("sincronizado_em").$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("bling_contatos_user_id_idx").on(table.userId),
    emailIdx: index("bling_contatos_email_idx").on(table.email),
  })
);

// ============ ESTOQUE SINCRONIZADO ============

export const blingEstoque = mysqlTable(
  "bling_estoque",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    produtoId: int("produto_id").notNull(),
    produtoSku: varchar("produto_sku", { length: 100 }).notNull(),
    quantidade: int("quantidade").notNull().default(0),
    quantidadeReservada: int("quantidade_reservada").notNull().default(0),
    quantidadeDisponivel: int("quantidade_disponivel").notNull().default(0),
    dataAtualizacao: datetime("data_atualizacao"),
    sincronizadoEm: datetime("sincronizado_em").$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("bling_estoque_user_id_idx").on(table.userId),
    produtoIdIdx: index("bling_estoque_produto_id_idx").on(table.produtoId),
  })
);

// ============ STATUS DE SINCRONIZAÇÃO ============

export const blingStatusSincronizacao = mysqlTable(
  "bling_status_sincronizacao",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 }).notNull().unique(),
    ultimaSincronizacao: datetime("ultima_sincronizacao"),
    proximaSincronizacao: datetime("proxima_sincronizacao"),
    statusProdutos: varchar("status_produtos", { length: 50 }).default("pendente"),
    statusPedidos: varchar("status_pedidos", { length: 50 }).default("pendente"),
    statusEstoque: varchar("status_estoque", { length: 50 }).default("pendente"),
    statusContatos: varchar("status_contatos", { length: 50 }).default("pendente"),
    erros: json("erros"),
    createdAt: datetime("created_at").$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at").$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("bling_status_user_id_idx").on(table.userId),
  })
);

// ============ RELAÇÕES ============

export const blingCredentialsRelations = relations(blingCredentials, ({ many }) => ({
  produtos: many(blingProdutos),
  pedidos: many(blingPedidos),
  contatos: many(blingContatos),
  estoque: many(blingEstoque),
}));

export const blingProdutosRelations = relations(blingProdutos, ({ one }) => ({
  credentials: one(blingCredentials, {
    fields: [blingProdutos.userId],
    references: [blingCredentials.userId],
  }),
}));

export const blingPedidosRelations = relations(blingPedidos, ({ one }) => ({
  credentials: one(blingCredentials, {
    fields: [blingPedidos.userId],
    references: [blingCredentials.userId],
  }),
}));

export const blingContatosRelations = relations(blingContatos, ({ one }) => ({
  credentials: one(blingCredentials, {
    fields: [blingContatos.userId],
    references: [blingCredentials.userId],
  }),
}));

export const blingEstoqueRelations = relations(blingEstoque, ({ one }) => ({
  credentials: one(blingCredentials, {
    fields: [blingEstoque.userId],
    references: [blingCredentials.userId],
  }),
}));
