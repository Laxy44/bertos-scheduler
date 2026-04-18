/**
 * Grayscale SVG wordmarks — fictional brands for social proof strip.
 * Uses currentColor for easy theming.
 */

function LogoCedarSalt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 168 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <title>Cedar &amp; Salt</title>
      <path
        d="M10 28V12l6-8 6 8v16M10 20h12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="32"
        y="23"
        fill="currentColor"
        style={{ font: "600 13px ui-sans-serif, system-ui, sans-serif", letterSpacing: "-0.02em" }}
      >
        Cedar & Salt
      </text>
    </svg>
  );
}

function LogoMarlowe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 152 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <title>Marlowe Café</title>
      <path
        d="M8 26c0-6 4-10 8-12 2 4 2 8 0 12M16 14v12M20 18c2 2 2 6 0 10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <text
        x="34"
        y="23"
        fill="currentColor"
        style={{ font: "600 13px ui-sans-serif, system-ui, sans-serif", letterSpacing: "-0.02em" }}
      >
        Marlowe Café
      </text>
    </svg>
  );
}

function LogoNorthlight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 188 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <title>Northlight Retail</title>
      <path d="M6 28 14 8l8 20M14 8v20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 16h8l-4 12-4-12z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <text
        x="38"
        y="23"
        fill="currentColor"
        style={{ font: "600 12.5px ui-sans-serif, system-ui, sans-serif", letterSpacing: "-0.02em" }}
      >
        Northlight Retail
      </text>
    </svg>
  );
}

function LogoBirchline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 172 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <title>Birchline Foods</title>
      <path
        d="M14 28c-4-8 0-14 6-18 2 6 2 12 0 18M14 28c4-6 8-10 12-12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <text
        x="34"
        y="23"
        fill="currentColor"
        style={{ font: "600 13px ui-sans-serif, system-ui, sans-serif", letterSpacing: "-0.02em" }}
      >
        Birchline Foods
      </text>
    </svg>
  );
}

export function TrustLogosRow() {
  const item =
    "flex h-11 items-center justify-center px-3 opacity-[0.72] grayscale transition duration-300 hover:opacity-100 md:h-12 md:px-5";
  const svg = "h-7 w-auto max-w-[min(168px,42vw)] text-slate-500 md:h-8";

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 md:gap-x-10 lg:gap-x-14">
      <div className={item}>
        <LogoCedarSalt className={svg} />
      </div>
      <div className={item}>
        <LogoMarlowe className={svg} />
      </div>
      <div className={item}>
        <LogoNorthlight className={svg} />
      </div>
      <div className={item}>
        <LogoBirchline className={svg} />
      </div>
    </div>
  );
}
