import { useEffect, useMemo, useState } from "react";
import { resolveAssetUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
};

export function ProfileAvatar({
  src,
  name,
  className,
  fallbackClassName,
  alt,
}: ProfileAvatarProps) {
  const imageUrl = resolveAssetUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const initials = useMemo(() => {
    const parts = (name ?? "Usuario")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    return parts || "US";
  }, [name]);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={alt ?? name ?? "Foto de perfil"}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("shrink-0 object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center bg-gradient-primary text-sm font-bold text-primary-foreground",
        className,
        fallbackClassName,
      )}
      aria-label={alt ?? name ?? "Foto de perfil"}
      role="img"
    >
      {initials}
    </div>
  );
}
