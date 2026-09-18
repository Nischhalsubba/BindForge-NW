export type CmdlistIgnoredLine = {
  lineNumber: number;
  raw: string;
};

export type ParsedCmdlist = {
  commands: string[];
  ignored: CmdlistIgnoredLine[];
};

export type CatalogCommandRecord = {
  command?: string;
  bindCommand?: string;
};

export type CmdlistReconciliation = {
  pastedCount: number;
  catalogCount: number;
  matched: string[];
  missingFromBindForge: string[];
  notSeenInPastedList: string[];
  ignored: CmdlistIgnoredLine[];
};

export function parseCmdlist(value?: string): ParsedCmdlist;
export function reconcileCmdlist(
  value?: string,
  catalogCommands?: Array<string | CatalogCommandRecord>,
): CmdlistReconciliation;
