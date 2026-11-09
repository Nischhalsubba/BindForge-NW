import Link from "next/link";
import { CloudWorkspacePanel } from "../components/CloudWorkspacePanel";
export default function AccountPage() {
  return <main className="app-shell"><p><Link href="/">Back to the keybind workbench</Link></p><CloudWorkspacePanel /></main>;
}
