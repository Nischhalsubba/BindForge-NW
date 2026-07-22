"use client";

import { useEffect } from "react";
import { RecoveryPanel } from "./components/RecoveryPanel";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <RecoveryPanel eyebrow="Recovery" title="BindForge hit an unexpected error" description="Your browser-saved settings should still be available. Retry the page, or return home if the problem continues." reference={error.digest ?? null}>
      <button className="primary-button" onClick={reset} type="button">Try again</button>
      <a className="secondary-button" href="/">Return home</a>
    </RecoveryPanel>
  );
}
