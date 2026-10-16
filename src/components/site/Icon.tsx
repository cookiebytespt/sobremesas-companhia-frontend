// Thin line icons in the style of the Instagram highlight badges.
const paths: Record<string, React.ReactNode> = {
  rings: (
    <>
      <circle cx="9" cy="14" r="5" />
      <circle cx="15" cy="14" r="5" />
      <path d="M13 5l2-2 2 2-2 2z" />
    </>
  ),
  dove: (
    <>
      <path d="M4 15c3 0 5-1 7-4l2-4c1-2 4-2 5 0l2 1-2 1c0 5-4 9-10 9H4l3-3" />
      <path d="M10 11c-2-1-4-3-4-6 3 0 5 2 6 4" />
    </>
  ),
  cross: (
    <>
      <path d="M12 3v18M7 8h10" />
    </>
  ),
  candle: (
    <>
      <path d="M4 20h16M6 20v-6h12v6M6 16c2 1 4-1 6 0s4 1 6 0" />
      <path d="M12 14v-4M12 7c-1-1 0-3 0-3s1 2 0 3" />
    </>
  ),
  cookie: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="9" cy="10" r="0.8" />
      <circle cx="14" cy="9" r="0.8" />
      <circle cx="15" cy="14" r="0.8" />
      <circle cx="10" cy="15" r="0.8" />
    </>
  ),
  cupcake: (
    <>
      <path d="M7 13l1.5 7h7L17 13" />
      <path d="M5 13c0-2 1.5-3 3-3 0-2.5 2-4 4-4s4 1.5 4 4c1.5 0 3 1 3 3z" />
      <circle cx="12" cy="4" r="1" />
    </>
  ),
  vase: (
    <>
      <path d="M9 21h6l1-6H8z" />
      <path d="M12 15V9M12 12l-3-3M12 12l3-3" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="8" cy="7.5" r="1.6" />
      <circle cx="16" cy="7.5" r="1.6" />
    </>
  ),
  platter: (
    <>
      <path d="M3 17h18M5 17a7 7 0 0114 0M12 10V8M10 8h4" />
    </>
  ),
  whisk: (
    <>
      <path d="M12 13v8" />
      <path d="M12 13c-4 0-5-5-5-7a5 5 0 0110 0c0 2-1 7-5 7z" />
      <path d="M12 13c-1.5 0-2.2-4-2.2-7M12 13c1.5 0 2.2-4 2.2-7M12 1v12" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" />
    </>
  ),
  chat: (
    <>
      <path d="M4 19l1.5-4A7.5 7.5 0 1112 19.5a7.6 7.6 0 01-3.6-.9z" />
    </>
  ),
};

export function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
