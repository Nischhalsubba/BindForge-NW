export type IconName = "forge" | "search" | "keyboard" | "code" | "shield" | "warning" | "copy" | "reset" | "filter" | "spark" | "star" | "check" | "close";

export function Icon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  const paths = {
    forge: <path d="M12 2 9 7l3 3 3-3-3-5Zm-5.5 9.5L3 15l6 6h6l6-6-3.5-3.5L15 14h-6l-2.5-2.5Z" />,
    search: <path d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />,
    keyboard: <path d="M3 6h18v12H3V6Zm4 4h.01M10 10h.01M13 10h.01M16 10h.01M7 13h.01M10 13h.01M13 13h4M7 16h10" />,
    code: <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-8-4 10" />,
    shield: <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    warning: <path d="M12 3 2.8 19h18.4L12 3Zm0 5v5m0 3h.01" />,
    copy: <path d="M8 8h11v11H8V8Zm-3 8H4V5h11v1" />,
    reset: <path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" />,
    filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
    spark: <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Zm6 11 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />,
    star: <path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3Z" />,
    check: <path d="m5 12.5 4.2 4.2L19 7" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
  };

  return (
    <svg aria-hidden="true" className="ui-icon" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
