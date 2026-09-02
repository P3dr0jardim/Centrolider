export function MiNunesLogo({ size = "md" }) {
  const sizes = {
    sm: { main: "text-xl" },
    md: { main: "text-3xl" },
    lg: { main: "text-5xl" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center leading-none">
      <div className={`${s.main} font-extrabold italic tracking-tight leading-none`}>
        <span style={{ color: "#0B3D91" }}>MI</span>
        <span style={{ color: "#EA580C" }}> NUNES</span>
      </div>
    </div>
  );
}
