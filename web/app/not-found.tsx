import Link from "next/link";
import { RecoveryPanel } from "./components/RecoveryPanel";

export default function NotFound() {
  return (
    <RecoveryPanel eyebrow="404" title="That BindForge page does not exist" description="The address may be outdated or mistyped. Return to the keybind builder to continue.">
      <Link className="primary-button" href="/">Return to BindForge</Link>
    </RecoveryPanel>
  );
}
