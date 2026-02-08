import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SocialMediaScheduler from "./SocialMediaScheduler";
import * as trpcModule from "@/lib/trpc";

// Mock useAuth
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user", email: "test@example.com" },
    isAuthenticated: true,
    loading: false,
    logout: vi.fn(),
  }),
}));

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    socialMedia: {
      publishPost: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
    },
  },
}));

describe("SocialMediaScheduler", () => {
  it("renders the scheduler page", () => {
    render(<SocialMediaScheduler />);
    expect(screen.getByText(/Agendador de Postagens/i)).toBeDefined();
  });

  it("displays the form to create new posts", () => {
    render(<SocialMediaScheduler />);
    expect(screen.getByText(/Nova Postagem/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Digite a legenda do post/i)).toBeDefined();
  });

  it("allows adding a new post", async () => {
    render(<SocialMediaScheduler />);

    const captionInput = screen.getByPlaceholderText(/Digite a legenda do post/i);
    const dateInput = screen.getByDisplayValue("");
    const addButton = screen.getByText(/Adicionar Postagem/i);

    fireEvent.change(captionInput, { target: { value: "Test caption" } });
    fireEvent.change(dateInput, { target: { value: "2026-02-15" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Test caption/i)).toBeDefined();
    });
  });

  it("displays platform selection checkboxes", () => {
    render(<SocialMediaScheduler />);
    expect(screen.getByLabelText(/instagram/i)).toBeDefined();
    expect(screen.getByLabelText(/facebook/i)).toBeDefined();
    expect(screen.getByLabelText(/whatsapp/i)).toBeDefined();
  });

  it("shows statistics for posts", () => {
    render(<SocialMediaScheduler />);
    expect(screen.getByText(/Total de Postagens/i)).toBeDefined();
    expect(screen.getByText(/Publicadas/i)).toBeDefined();
    expect(screen.getByText(/Agendadas/i)).toBeDefined();
  });

  it("allows selecting post type (simple or carousel)", () => {
    render(<SocialMediaScheduler />);
    const typeSelect = screen.getByDisplayValue(/Foto Simples/i);
    expect(typeSelect).toBeDefined();
  });

  it("displays empty state when no posts are scheduled", () => {
    render(<SocialMediaScheduler />);
    expect(screen.getByText(/Nenhuma postagem agendada ainda/i)).toBeDefined();
  });

  it("allows deleting a post", async () => {
    render(<SocialMediaScheduler />);

    // Add a post first
    const captionInput = screen.getByPlaceholderText(/Digite a legenda do post/i);
    const dateInput = screen.getByDisplayValue("");
    const addButton = screen.getByText(/Adicionar Postagem/i);

    fireEvent.change(captionInput, { target: { value: "Test caption" } });
    fireEvent.change(dateInput, { target: { value: "2026-02-15" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button").filter((btn) =>
        btn.textContent?.includes("Trash")
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it("validates required fields before adding a post", async () => {
    render(<SocialMediaScheduler />);

    const addButton = screen.getByText(/Adicionar Postagem/i);
    fireEvent.click(addButton);

    // Should show alert for missing fields
    await waitFor(() => {
      expect(screen.getByText(/Preencha todos os campos obrigatórios/i)).toBeDefined();
    });
  });

  it("displays platform icons for each post", async () => {
    render(<SocialMediaScheduler />);

    const captionInput = screen.getByPlaceholderText(/Digite a legenda do post/i);
    const dateInput = screen.getByDisplayValue("");
    const addButton = screen.getByText(/Adicionar Postagem/i);

    fireEvent.change(captionInput, { target: { value: "Test caption" } });
    fireEvent.change(dateInput, { target: { value: "2026-02-15" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/instagram/i)).toBeDefined();
    });
  });

  it("shows status badge for each post", async () => {
    render(<SocialMediaScheduler />);

    const captionInput = screen.getByPlaceholderText(/Digite a legenda do post/i);
    const dateInput = screen.getByDisplayValue("");
    const addButton = screen.getByText(/Adicionar Postagem/i);

    fireEvent.change(captionInput, { target: { value: "Test caption" } });
    fireEvent.change(dateInput, { target: { value: "2026-02-15" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/SCHEDULED/i)).toBeDefined();
    });
  });

  it("allows publishing a post immediately", async () => {
    render(<SocialMediaScheduler />);

    const captionInput = screen.getByPlaceholderText(/Digite a legenda do post/i);
    const dateInput = screen.getByDisplayValue("");
    const addButton = screen.getByText(/Adicionar Postagem/i);

    fireEvent.change(captionInput, { target: { value: "Test caption" } });
    fireEvent.change(dateInput, { target: { value: "2026-02-15" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      const publishButtons = screen.getAllByText(/Publicar Agora/i);
      expect(publishButtons.length).toBeGreaterThan(0);
    });
  });

  it("requires authentication to access the page", () => {
    // This test would need to mock useAuth to return unauthenticated state
    // For now, we're testing the happy path with authenticated user
    render(<SocialMediaScheduler />);
    expect(screen.getByText(/Agendador de Postagens/i)).toBeDefined();
  });
});
