interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  variant?: "light" | "dark";
}

export function Logo({ size = "md", showText = true, variant = "dark" }: LogoProps) {
  const dims = { sm: { h: 32, t: 14 }, md: { h: 40, t: 18 }, lg: { h: 56, t: 24 } }[size];
  const textColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className="flex items-center justify-center rounded-xl shadow-md"
        style={{
          width: dims.h,
          height: dims.h,
          background: "linear-gradient(135deg, #E11D48 0%, #F43F5E 60%, #F59E0B 100%)",
        }}
      >
        <svg viewBox="0 0 64 64" width={dims.h * 0.7} height={dims.h * 0.7} fill="none">
          {/* Shopping bag silhouette */}
          <path
            d="M16 22h32l-2 28a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4l-2-28z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M24 24v-2a8 8 0 0 1 16 0v2"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* "L" mark inside bag */}
          <path
            d="M28 36v-6h2.5v4h4v2h-6.5z"
            fill="#E11D48"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${textColor}`} style={{ fontSize: dims.t }}>
            Lal<span className="text-primary">Bazar</span>
          </span>
          <span className={`text-[10px] ${variant === "light" ? "text-white/70" : "text-muted-foreground"} font-bengali mt-0.5`}>
            লালবাজার
          </span>
        </div>
      )}
    </div>
  );
}
