/**
 * Tipos para integração com Bling API v3
 */

// ============ AUTENTICAÇÃO ============

export interface BlingOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface BlingAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// ============ PRODUTOS ============

export interface BlingProduto {
  id: number;
  nome: string;
  descricao?: string;
  sku: string;
  preco: number;
  precoCusto?: number;
  estoque: number;
  ativo: boolean;
  categoria?: {
    id: number;
    nome: string;
  };
  imagens?: BlingImagem[];
  peso?: number;
  dimensoes?: {
    altura: number;
    largura: number;
    profundidade: number;
  };
  dataAtualizacao: string;
}

export interface BlingImagem {
  id: number;
  url: string;
  principal: boolean;
}

export interface BlingProdutoResponse {
  data: BlingProduto[];
  paginacao?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// ============ PEDIDOS ============

export interface BlingPedido {
  id: number;
  numero: string;
  numeroLoja?: string;
  dataEmissao: string;
  dataEntrega?: string;
  cliente: BlingCliente;
  itens: BlingItemPedido[];
  total: number;
  desconto?: number;
  frete?: number;
  status: BlingStatusPedido;
  observacoes?: string;
  rastreamento?: string;
}

export interface BlingCliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  cpfCnpj?: string;
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

export interface BlingItemPedido {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  preco: number;
  desconto?: number;
  total: number;
}

export enum BlingStatusPedido {
  ABERTO = "aberto",
  PROCESSANDO = "processando",
  ENVIADO = "enviado",
  ENTREGUE = "entregue",
  CANCELADO = "cancelado",
  DEVOLVIDO = "devolvido",
}

export interface BlingPedidoResponse {
  data: BlingPedido[];
  paginacao?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// ============ CONTATOS ============

export interface BlingContato {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  cpfCnpj?: string;
  tipo: "pessoa_fisica" | "pessoa_juridica";
  endereco?: BlingEndereco;
  dataAtualizacao: string;
}

export interface BlingEndereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface BlingContatoResponse {
  data: BlingContato[];
  paginacao?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// ============ NOTAS FISCAIS ============

export interface BlingNotaFiscal {
  id: number;
  numero: string;
  serie: string;
  dataEmissao: string;
  pedidoId?: number;
  cliente: BlingCliente;
  itens: BlingItemNotaFiscal[];
  total: number;
  desconto?: number;
  frete?: number;
  status: "emitida" | "cancelada" | "devolvida";
  chaveAcesso?: string;
  urlDanfe?: string;
}

export interface BlingItemNotaFiscal {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  preco: number;
  desconto?: number;
  total: number;
}

export interface BlingNotaFiscalResponse {
  data: BlingNotaFiscal[];
  paginacao?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// ============ ESTOQUE ============

export interface BlingEstoque {
  produtoId: number;
  produtoSku: string;
  quantidade: number;
  quantidadeReservada: number;
  quantidadeDisponivel: number;
  dataAtualizacao: string;
}

export interface BlingEstoqueResponse {
  data: BlingEstoque[];
}

// ============ WEBHOOK ============

export interface BlingWebhookEvent {
  id: string;
  tipo: BlingWebhookTipo;
  timestamp: string;
  dados: Record<string, any>;
}

export enum BlingWebhookTipo {
  PRODUTO_CRIADO = "produto.criado",
  PRODUTO_ATUALIZADO = "produto.atualizado",
  PRODUTO_DELETADO = "produto.deletado",
  PEDIDO_CRIADO = "pedido.criado",
  PEDIDO_ATUALIZADO = "pedido.atualizado",
  PEDIDO_CANCELADO = "pedido.cancelado",
  ESTOQUE_ATUALIZADO = "estoque.atualizado",
  NOTA_FISCAL_EMITIDA = "notafiscal.emitida",
}

// ============ ERROS ============

export interface BlingErrorResponse {
  erros: BlingError[];
}

export interface BlingError {
  codigo: string;
  mensagem: string;
  campo?: string;
}

// ============ SINCRONIZAÇÃO ============

export interface SincronizacaoBlingStatus {
  ultimaSincronizacao: Date;
  proximaSincronizacao: Date;
  statusProdutos: "sucesso" | "erro" | "pendente";
  statusPedidos: "sucesso" | "erro" | "pendente";
  statusEstoque: "sucesso" | "erro" | "pendente";
  erros?: string[];
}
