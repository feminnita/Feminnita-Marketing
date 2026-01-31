import { cn } from "@/lib/utils";

interface PersonaAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const personaImages = {
  Carol: "/images/persona-carol.png",
  Renata: "/images/persona-renata.png",
  Vanessa: "/images/persona-vanessa.png",
  Luiza: "/images/persona-luiza.png",
};

export default function PersonaAvatar({ name, size = "md", showName = false }: PersonaAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const image = personaImages[name as keyof typeof personaImages];

  return (
    <div className="flex items-center gap-2">
      {image && (
        <img
          src={image}
          alt={name}
          className={cn("rounded-full object-cover border-2 border-slate-200", sizeClasses[size])}
        />
      )}
      {showName && <span className="font-medium text-slate-900">{name}</span>}
    </div>
  );
}
