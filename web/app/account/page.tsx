/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation resets the vanilla workbench runtime and its page-scoped styles. */
import { CloudWorkspacePanel } from "../components/CloudWorkspacePanel";
export default function AccountPage() {
  return (
    <>
      <header className="site-header">
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
