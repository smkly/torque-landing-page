"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Lazy-loaded PostHog instance - initialized on first load, not at import time
let posthogInstance: any = null;
let posthogLoadPromise: Promise<any> | null = null;

function getPostHog(): Promise<any> {
  if (posthogInstance) return Promise.resolve(posthogInstance);
  if (posthogLoadPromise) return posthogLoadPromise;

  posthogLoadPromise = import("posthog-js").then((mod) => {
    posthogInstance = mod.default;
    return posthogInstance;
  });

  return posthogLoadPromise;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key) return;

    initialized.current = true;

    // Defer PostHog loading until after the page is interactive
    const loadPostHog = () => {
      getPostHog().then((posthog) => {
        posthog.init(key, {
          api_host: host || "https://us.i.posthog.com",
          capture_pageview: false,
          capture_pageleave: true,
          autocapture: true,
          session_recording: {
            maskAllInputs: false,
            maskInputFn: (text: string, element: HTMLElement | null) => {
              const type = element?.getAttribute("type");
              if (type === "password") return "*".repeat(text.length);
              return text;
            },
          },
          enable_heatmaps: true,
        });
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(loadPostHog);
    } else {
      setTimeout(loadPostHog, 1);
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </>
  );
}

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    getPostHog().then((posthog) => {
      if (!posthog.__loaded) return; // Not initialized yet

      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) url += "?" + search;

      posthog.capture("$pageview", { $current_url: url });
    });
  }, [pathname, searchParams]);

  return null;
}
