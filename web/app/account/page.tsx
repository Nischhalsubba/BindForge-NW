/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages -- Full navigation resets the vanilla workbench runtime and its page-scoped styles. */
import { CloudWorkspacePanel } from "../components/CloudWorkspacePanel";
export default function AccountPage() {
  return (
    <>
      <header className="site-header">
        <a className="identity" href="/">
          <img
            className="brand-emblem"
            src="/workbench/assets/neverwinter.webp"
            alt="Neverwinter"
            width="54"
            height="54"
          />
          <span className="brand-name">
            BindForge <small>NEVERWINTER WORKSPACE</small>
          </span>
        </a>
        <a href="/">Back to workbench</a>
      </header>
      <main className="account-main">
        <CloudWorkspacePanel />
      </main>
    </>
  );
}
