/**
 * Componente genérico para botões de features
 * Suporta ações síncronas, assíncronas e navegação
 */

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FeatureButtonProps {
  label: string;
  icon?: ReactNode;
  onClick?: () => void | Promise<void>;
  onNavigate?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function FeatureButton({
  label,
  icon,
  onClick,
  onNavigate,
  disabled = false,
  loading = false,
  variant = "default",
  size = "default",
  className = "",
  successMessage = "Ação realizada com sucesso!",
  errorMessage = "Erro ao executar ação",
}: FeatureButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (onNavigate) {
      onNavigate();
      return;
    }

    if (!onClick) return;

    try {
      setIsLoading(true);
      await onClick();
      console.log(successMessage);
    } catch (error) {
      console.error("Erro em FeatureButton:", error, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || isLoading || loading;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading || loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </>
      )}
    </Button>
  );
}
