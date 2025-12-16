import Image from "next/image";

type BrandLogoProps = {
  variant?: "color" | "white";
  size?: "sm" | "lg";
  className?: string;
};

const sizes = {
  sm: { height: 56, width: 224, className: "h-14 w-auto" },
  lg: { height: 160, width: 427, className: "h-40 w-auto" },
} as const;

const variants = {
  color: "/assets/logos/logo-color.png",
  white: "/assets/logos/logo-white.png",
} as const;

export function BrandLogo({ variant = "color", size = "sm", className = "" }: BrandLogoProps) {
  const { height, width, className: sizeClass } = sizes[size];
  const src = variants[variant];

  return (
    <Image
      alt="Starter SaaS"
      className={`${sizeClass} ${className}`.trim()}
      height={height}
      src={src}
      width={width}
    />
  );
}
