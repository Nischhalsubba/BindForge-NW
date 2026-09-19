export type CommandAction = {
  id: string;
  label: string;
  keywords?: string;
  hash?: string;
  action?: "settings";
};
export const DEFAULT_COMMAND_ACTIONS: readonly CommandAction[];
export function filterCommandActions(actions: readonly CommandAction[] | undefined, query?: string): CommandAction[];
