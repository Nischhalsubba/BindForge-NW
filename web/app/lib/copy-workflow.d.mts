export type CopyItem={text:string;label:string;copiedAt:string;pinned:boolean};
export type CopyHistory={version:1;shortcutEnabled:boolean;items:CopyItem[]};
export const COPY_HISTORY_KEY:string;
export function parseCopyHistory(raw:unknown):CopyHistory;
export function recordCopy(state:unknown,entry:{text:string;label:string},copiedAt?:string):CopyHistory;
export function togglePin(state:unknown,text:string):CopyHistory;
export function pairedBindOutput(text:string):string|null;
