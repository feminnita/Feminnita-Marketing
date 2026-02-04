import { cn } from "@/lib/utils";

interface PersonaAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const personaImages = {
  Carol: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663030153148/fmGkGhjBbWsPWfzJ.png",
  Renata: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663030153148/iBpLrsLcdOKXJVOf.png",
  Vanessa: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663030153148/urQYvzTuJucHBYSJ.png",
  Luiza: "https://private-us-east-1.manuscdn.com/sessionFile/U2UU1fxXPVayac4O1B5rRw/sandbox/edCAbt7vHzcdMWHXrQdRUN-img-1_1770202910000_na1fn_cGVyc29uYS1sdWl6YQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVTJVVTFmeFhQVmF5YWM0TzFCNXJSdy9zYW5kYm94L2VkQ0FidDd2SHpjZE1XSFhyUWRSVU4taW1nLTFfMTc3MDIwMjkxMDAwMF9uYTFmbl9jR1Z5YzI5dVlTMXNkV2w2WVEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=RsLU5LV8Z1tQkdJpP6-ZgTvk~fLF08-gldO45hRU84CP38i1MO84ZIwj~edwzO5KFdGzqOWF53NzhTNhc9OWjRcQ2zaTw9iqvh9XOB4Sy8MvOkUV1zOqyg8HtBJF74JEaymU~sFm0hc-mZ-7-j0ZrdcnnvFV9uUJZpFZGR5PSWcuts3IOt5I~ALcQ--6SmdYbiMbSC1UI4exmfNQvk1DHlWLsMuotu9qjZ2SVacZZQS1F~iMR6rrV~mU99R6e6~RurA6~iRj5gmCnkmE4HvNEynraYBgiCnPl5kKLfIBoLLQWuM0xPOOz1AAMDT4aH3dyRzagtqcV0jqMwsX3a1yTg__",
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
