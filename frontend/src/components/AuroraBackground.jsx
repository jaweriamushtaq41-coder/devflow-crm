// A calm, drifting gradient-mesh background for the auth screens.
// Pure CSS animation (no Three.js/canvas) — keeps things fast and battery-friendly
// while still delivering the "hero moment" the brand needs on first impression.
export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-hero">
      <div className="absolute inset-0 bg-aurora-1 animate-drift1" />
      <div className="absolute inset-0 bg-aurora-2 animate-drift2" />
      <div className="absolute inset-0 bg-aurora-3 animate-drift3" />
      {/* subtle grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-hero/60" />
    </div>
  );
}
