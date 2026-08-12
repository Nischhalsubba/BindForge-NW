import { RecoveryPanel } from "./components/RecoveryPanel";

export default function Loading() {
  return <RecoveryPanel busy eyebrow="Loading" title="Heating the forge" description="BindForge is preparing the keybind catalog and your saved browser settings." />;
}
