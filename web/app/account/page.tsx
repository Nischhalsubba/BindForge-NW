/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation resets the vanilla workbench runtime and its page-scoped styles. */
/* eslint-disable @next/next/no-css-tags -- Retained workbench styles load only on workbench/account documents. */
import { CloudWorkspacePanel } from "../components/CloudWorkspacePanel";
export default function AccountPage() {
  return (
    <>
      <link rel="stylesheet" href="/workbench/vendor/bootstrap.min.css" />
      <link rel="stylesheet" href="/workbench/tokens.css" />
      <link rel="stylesheet" href="/workbench/style.css" />
      <link rel="stylesheet" href="/workbench/components.css" />
      <header>
        <a className="identity" href="/">
          <span className="brand-name">
            BindForge <small>NEVERWINTER WORKSPACE</small>
          </span>
        </a>
        <a href="/">Back to workbench</a>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto" }}>
        <CloudWorkspacePanel />
      </main>
    </>
  );
}
