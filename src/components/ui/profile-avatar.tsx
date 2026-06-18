import { useEffect, useMemo, useState } from "react";
import { API_ROOT_URL, resolveAssetUrl } from "@/lib/api";
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
  const imageCandidates = useMemo(() => buildImageCandidates(src), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const imageUrl = imageCandidates[candidateIndex] ?? null;

  useEffect(() => {
    setCandidateIndex(0);
  }, [imageCandidates]);

  const initials = useMemo(() => {
    const parts = (name ?? "Usuario")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    return parts || "US";
  }, [name]);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt ?? name ?? "Foto de perfil"}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setCandidateIndex((current) => current + 1)}
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

function buildImageCandidates(value?: string | null): string[] {
  if (!value) return [];

  const normalizedRoot = API_ROOT_URL.replace(/\/$/, "");
  const cleanValue = value.trim();
  const candidates = [
    resolveAssetUrl(cleanValue),
  ];

  const storageMatch = cleanValue.match(/\/storage\/(.+)$/i);
  if (storageMatch?.[1]) {
    candidates.push(`${normalizedRoot}/api/media/${storageMatch[1].replace(/^\/+/, "")}`);
  }

  const mediaMatch = cleanValue.match(/\/api\/media\/(.+)$/i);
  if (mediaMatch?.[1]) {
    candidates.push(`${normalizedRoot}/api/media/${mediaMatch[1].replace(/^\/+/, "")}`);
  }

  const profilePhotoMatch = cleanValue.match(/(profile[_-]?photos\/.+)$/i);
  if (profilePhotoMatch?.[1]) {
    candidates.push(`${normalizedRoot}/api/media/${profilePhotoMatch[1].replace(/^\/+/, "")}`);
  }

  if (!/^https?:\/\//i.test(cleanValue)) {
    candidates.push(`${normalizedRoot}/api/media/${cleanValue.replace(/^\/+/, "")}`);
  }

  return [...new Set(candidates.filter(Boolean) as string[])];
}
