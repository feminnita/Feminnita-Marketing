import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import MetaAdsCampaigns from "./MetaAdsCampaigns";

// Mock do trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    metaAdsCampaigns: {
      listActiveCampaigns: {
        useQuery: vi.fn(() => ({
          data: {
            campaigns: [
              {
                id: "campaign_1",
                name: "Verão 2026 - Coleção Premium",
                description: "Campanha de verão",
                budget: 150,
                spent: 45.5,
                status: "active",
                metrics: { roi: 2.5, impressions: 13901, clicks: 858 },
              },
            ],
          },
          isLoading: false,
          refetch: vi.fn(),
        })),
      },
      importarCampanhasReais: {
        useQuery: vi.fn(() => ({
          data: { campanhas: [] },
          isLoading: false,
        })),
      },
      getCampaignMetrics: {
        useQuery: vi.fn(() => ({
          data: { impressions: 13901, clicks: 858, conversions: 85, roi: 2.78 },
          isLoading: false,
        })),
      },
      obterMetricasDetalhadas: {
        useQuery: vi.fn(() => ({
          data: { metricas: {} },
          isLoading: false,
        })),
      },
      obterAnuncios: {
        useQuery: vi.fn(() => ({
          data: { anuncios: [] },
          isLoading: false,
        })),
      },
      obterPublicosAlvo: {
        useQuery: vi.fn(() => ({
          data: { publicosAlvo: [] },
          isLoading: false,
        })),
      },
      obterHistorico: {
        useQuery: vi.fn(() => ({
          data: { historico: [] },
          isLoading: false,
        })),
      },
      pauseCampaign: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
          isPending: false,
        })),
      },
      resumeCampaign: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
          isPending: false,
        })),
      },
      optimizeCampaign: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
          isPending: false,
        })),
      },
      sincronizarTempoReal: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
          isPending: false,
        })),
      },
    },
  },
}));

describe("MetaAdsCampaigns", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("should render the page with campaigns", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    expect(screen.getByText("Campanhas Meta Ads")).toBeInTheDocument();
    expect(screen.getByText("Verão 2026 - Coleção Premium")).toBeInTheDocument();
  });

  it("should select a campaign when clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const campaignCard = screen.getByText("Verão 2026 - Coleção Premium");
    fireEvent.click(campaignCard);

    await waitFor(() => {
      expect(screen.getByText("Pausar Campanha")).toBeInTheDocument();
      expect(screen.getByText("Retomar Campanha")).toBeInTheDocument();
      expect(screen.getByText("Otimizar Campanha")).toBeInTheDocument();
    });
  });

  it("should have type='button' on action buttons", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const campaignCard = screen.getByText("Verão 2026 - Coleção Premium");
    fireEvent.click(campaignCard);

    await waitFor(() => {
      const pauseButton = screen.getByText("Pausar Campanha") as HTMLButtonElement;
      const resumeButton = screen.getByText("Retomar Campanha") as HTMLButtonElement;
      const optimizeButton = screen.getByText("Otimizar Campanha") as HTMLButtonElement;

      expect(pauseButton.type).toBe("button");
      expect(resumeButton.type).toBe("button");
      expect(optimizeButton.type).toBe("button");
    });
  });

  it("should call pause mutation when pause button is clicked", async () => {
    const pauseMutationMock = vi.fn();
    vi.mocked(trpc.metaAdsCampaigns.pauseCampaign.useMutation).mockReturnValue({
      mutateAsync: pauseMutationMock,
      isPending: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const campaignCard = screen.getByText("Verão 2026 - Coleção Premium");
    fireEvent.click(campaignCard);

    await waitFor(() => {
      const pauseButton = screen.getByText("Pausar Campanha");
      fireEvent.click(pauseButton);
    });

    // Verificar que a mutação foi chamada
    expect(pauseMutationMock).toHaveBeenCalled();
  });

  it("should toggle auto-refresh when button is clicked", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const autoRefreshButton = screen.getByText("Auto-refresh ON");
    fireEvent.click(autoRefreshButton);

    expect(screen.getByText("Auto-refresh OFF")).toBeInTheDocument();
  });

  it("should display metrics when campaign is selected", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const campaignCard = screen.getByText("Verão 2026 - Coleção Premium");
    fireEvent.click(campaignCard);

    await waitFor(() => {
      expect(screen.getByText("Impressões")).toBeInTheDocument();
      expect(screen.getByText("Cliques")).toBeInTheDocument();
      expect(screen.getByText("Conversões")).toBeInTheDocument();
    });
  });

  it("should have type='button' on auto-refresh button", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const autoRefreshButton = screen.getByText(/Auto-refresh/) as HTMLButtonElement;
    expect(autoRefreshButton.type).toBe("button");
  });

  it("should have type='button' on sync button", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const syncButton = screen.getByText("Sincronizar Agora") as HTMLButtonElement;
    expect(syncButton.type).toBe("button");
  });

  it("should toggle auto-refresh state when button is clicked", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const autoRefreshButton = screen.getByText("Auto-refresh ON");
    fireEvent.click(autoRefreshButton);

    expect(screen.getByText("Auto-refresh OFF")).toBeInTheDocument();
  });

  it("should call sync mutation when sync button is clicked", async () => {
    const syncMutationMock = vi.fn();
    vi.mocked(trpc.metaAdsCampaigns.sincronizarTempoReal.useMutation).mockReturnValue({
      mutateAsync: syncMutationMock,
      isPending: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MetaAdsCampaigns />
      </QueryClientProvider>
    );

    const syncButton = screen.getByText("Sincronizar Agora");
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(syncMutationMock).toHaveBeenCalled();
    });
  });
});
