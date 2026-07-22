"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

function subscribeToDarkClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getIsDark() {
  return document.documentElement.classList.contains("dark");
}

function getIsDarkServerSnapshot() {
  return false;
}

function getIsMounted() {
  return true;
}

function getIsMountedServerSnapshot() {
  return false;
}

function setStoredTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  window.localStorage.setItem("theme", dark ? "dark" : "light");
}

export function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(
    subscribeToDarkClass,
    getIsDark,
    getIsDarkServerSnapshot
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    getIsMounted,
    getIsMountedServerSnapshot
  );

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = !isDark;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
      if (!prefersReducedMotion) {
        document.documentElement.classList.add("theme-transition");
        window.setTimeout(
          () => document.documentElement.classList.remove("theme-transition"),
          550
        );
      }
      setStoredTheme(next);
      return;
    }

    const { clientX: x, clientY: y } = event;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => setStoredTheme(next));

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 550,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card text-foreground transition-colors duration-300 hover:bg-muted active:scale-95",
        className
      )}
    >
      <Sun
        weight="bold"
        className={cn(
          "absolute size-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          mounted && isDark
            ? "translate-y-6 rotate-90 opacity-0"
            : "translate-y-0 rotate-0 opacity-100"
        )}
      />
      <Moon
        weight="bold"
        className={cn(
          "absolute size-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          mounted && isDark
            ? "translate-y-0 rotate-0 opacity-100"
            : "-translate-y-6 -rotate-90 opacity-0"
        )}
      />
    </button>
  );
}
