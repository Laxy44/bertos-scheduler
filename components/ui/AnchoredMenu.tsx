"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

export type AnchoredMenuAlign = "start" | "end";

type AnchoredMenuProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: AnchoredMenuAlign;
  /** Tailwind width / min-width classes, e.g. w-56 min-w-[12rem] */
  contentClassName?: string;
};

/**
 * Fixed-position menu portaled to document.body so it is not clipped by
 * overflow-hidden / sticky ancestors. Repositions on scroll (capture) and resize.
 */
export function AnchoredMenu({
  open,
  onClose,
  anchorRef,
  children,
  align = "start",
  contentClassName = "w-56",
}: AnchoredMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    right: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || !open) return;

    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    const top = rect.bottom + gap;
    if (align === "end") {
      setCoords({
        top,
        left: 0,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    } else {
      setCoords({
        top,
        left: rect.left,
        right: 0,
      });
    }
  }, [anchorRef, open, align]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    function onPointerDown(e: MouseEvent) {
      const node = e.target as Node;
      if (panelRef.current?.contains(node)) return;
      if (anchorRef.current?.contains(node)) return;
      onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined" || coords === null) {
    return null;
  }

  const style: CSSProperties =
    align === "end"
      ? {
          position: "fixed",
          top: coords.top,
          left: "auto",
          right: coords.right,
          zIndex: 200,
        }
      : {
          position: "fixed",
          top: coords.top,
          left: Math.min(coords.left, window.innerWidth - 280),
          zIndex: 200,
        };

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={`rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.18)] ${contentClassName}`}
      role="presentation"
    >
      {children}
    </div>,
    document.body
  );
}
