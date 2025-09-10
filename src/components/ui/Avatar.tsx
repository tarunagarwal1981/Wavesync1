import React from "react";
import styles from "./Avatar.module.css";

type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string; // used for initials fallback
  size?: AvatarSize;
}

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";
  return (first + last).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = "md", className, ...props }) => {
  const [errored, setErrored] = React.useState(false);
  const showImage = src && !errored;
  const classes = [styles.avatar, size !== "md" ? styles[size] : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-label={alt || name} role="img" {...props}>
      {showImage ? (
        <img className={styles.img} src={src} alt={alt || name || "avatar"} onError={() => setErrored(true)} />
      ) : (
        <span className={styles.fallback} aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;

