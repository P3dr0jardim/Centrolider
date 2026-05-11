export function CentroliderLogo({ size = "md" }) {
  const sizes = {
    sm: { main: "text-xl",   sub: "text-[9px]",  gap: "gap-0" },
    md: { main: "text-3xl",  sub: "text-[11px]", gap: "gap-0.5" },
    lg: { main: "text-5xl",  sub: "text-sm",     gap: "gap-1" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center leading-none ${s.gap}`}>
      <div className={`${s.main} font-extrabold italic tracking-tight leading-none`}>
        <span style={{ color: "#1B2F6E" }}>CENTRO</span>
        <span style={{ color: "#F47920" }}>LIDER</span>
      </div>
      <div className={`${s.sub} font-bold italic tracking-widest`} style={{ color: "#1B2F6E" }}>
        GESTÃO DE FROTAS
      </div>
    </div>
  );
}
