export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark${compact ? " brand-mark--compact" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="13" fill="url(#brand-gradient)" />
        <path d="M12.75 27.2v-10a7.25 7.25 0 0 1 14.5 0v10" stroke="white" strokeWidth="3.25" strokeLinecap="round" />
        <circle cx="27.2" cy="27.1" r="3.3" fill="#D9D2FF" />
        <defs><linearGradient id="brand-gradient" x1="4" y1="3" x2="38" y2="39" gradientUnits="userSpaceOnUse"><stop stopColor="#9282FF" /><stop offset="1" stopColor="#5141D9" /></linearGradient></defs>
      </svg>
    </span>
  );
}
