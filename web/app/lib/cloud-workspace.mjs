import { parseBackupJson } from './backup-schema.mjs';
import { parseProfileWorkspaceJson } from './profile-workspace.mjs';
export const MAX_CLOUD_BYTES = 2 * 1024 * 1024;
export const CLOUD_DOCUMENT_KEYS = Object.freeze([
  'bindforge-nw:settings:v2','bindforge-nw:library:v1','bindforge-nw:profiles:v1',
  'bindforge-nw:profile-history:v1','bindforge-nw:keyboard-layout:v1',
  'bindforge-nw:builder:v1','bindforge-nw:copy-history:v1',
]);
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function validateEnvelope(value) {
  try {
    if(!record(value)||value.schemaVersion!==1||!record(value.documents)||typeof value.exportedAt!=='string'||!Number.isFinite(Date.parse(value.exportedAt)))return {ok:false,error:'Invalid workspace envelope.'};
    if(new TextEncoder().encode(JSON.stringify(value)).length>MAX_CLOUD_BYTES)return {ok:false,error:'Workspace exceeds the 2 MB limit.'};
    const documents={};
    for(const [key,raw] of Object.entries(value.documents)) {
      if(!CLOUD_DOCUMENT_KEYS.includes(key)||typeof raw!=='string')return {ok:false,error:'Unsupported workspace document.'};
      if(key==='bindforge-nw:keyboard-layout:v1'){if(!['us-ansi','qwertz','azerty'].includes(raw))return {ok:false,error:'Invalid keyboard layout.'};}
      else {const parsed=JSON.parse(raw);if(!record(parsed)&&!Array.isArray(parsed))return {ok:false,error:'Invalid document structure.'};
        if(key==='bindforge-nw:settings:v2'&&!parseBackupJson(raw).ok)return {ok:false,error:'Invalid settings document.'};
        if(key==='bindforge-nw:profiles:v1'&&!parseProfileWorkspaceJson(raw).ok)return {ok:false,error:'Invalid character/profile document.'};}
      if(key!=='bindforge-nw:keyboard-layout:v1') {
        const doc=JSON.parse(raw),strings=v=>Array.isArray(v)&&v.every(x=>typeof x==='string'),chain=v=>Array.isArray(v)&&v.length<=100&&v.every(x=>record(x)&&Number.isSafeInteger(x.instanceId)&&typeof x.label==='string'&&typeof x.fragment==='string'&&x.fragment.length<=2000&&['settings-screenshot','user-provided-working-bind','custom'].includes(x.source));
        if(key==='bindforge-nw:library:v1'&&(!record(doc)||!strings(doc.favourites)||(doc.collections!==undefined&&(!record(doc.collections)||!Object.values(doc.collections).every(strings)))))return {ok:false,error:'Invalid library document.'};
        if(key==='bindforge-nw:builder:v1'&&(!record(doc)||doc.version!==1||typeof doc.key!=='string'||!chain(doc.chain)||!Array.isArray(doc.saved)||doc.saved.length>30||!doc.saved.every(x=>record(x)&&typeof x.name==='string'&&typeof x.key==='string'&&chain(x.chain))))return {ok:false,error:'Invalid builder document.'};
        if(key==='bindforge-nw:copy-history:v1'&&(!record(doc)||doc.version!==1||typeof doc.shortcutEnabled!=='boolean'||!Array.isArray(doc.items)||doc.items.length>50||!doc.items.every(x=>record(x)&&typeof x.text==='string'&&x.text.length<=20000&&typeof x.label==='string'&&typeof x.copiedAt==='string'&&typeof x.pinned==='boolean')))return {ok:false,error:'Invalid copy history.'};
        if(key==='bindforge-nw:profile-history:v1'&&(!record(doc)||!Object.values(doc).every(rows=>Array.isArray(rows)&&rows.every(x=>record(x)&&typeof x.id==='string'&&typeof x.createdAt==='string'&&record(x.keyValues)&&Object.values(x.keyValues).every(v=>typeof v==='string')&&Array.isArray(x.personalBinds)))))return {ok:false,error:'Invalid profile history.'};
      }
      documents[key]=raw;
    }
    return {ok:true,value:{schemaVersion:1,exportedAt:value.exportedAt,documents}};
  }catch{return {ok:false,error:'Workspace could not be validated.'};}
}
export function collectWorkspace(storage,exportedAt=new Date().toISOString()) {
  const documents={};
  for(const key of CLOUD_DOCUMENT_KEYS){const raw=storage.getItem(key);if(raw!==null)documents[key]=raw;}
  const result=validateEnvelope({schemaVersion:1,exportedAt,documents});
  if(!result.ok)throw new Error(result.error);
  return result.value;
}
export function workspaceFingerprint(envelope) {
  const stable=v=>Array.isArray(v)?v.map(stable):record(v)?Object.fromEntries(Object.keys(v).sort().map(key=>[key,stable(v[key])])):v;
  return JSON.stringify(Object.entries(envelope.documents).sort(([a],[b])=>a.localeCompare(b)).map(([key,raw])=>{if(key==='bindforge-nw:keyboard-layout:v1')return [key,raw];const doc=JSON.parse(raw);if(key==='bindforge-nw:settings:v2')delete doc.savedAt;return [key,JSON.stringify(stable(doc))];}));
}
export function planSync({local,remote,baseRevision,baseFingerprint,migrationApproved=false}) {
  if(!validateEnvelope(local).ok)return {action:'invalid'};
  if(!migrationApproved)return {action:'review'};
  if(remote){if(!Number.isSafeInteger(remote.revision)||remote.revision<1||!validateEnvelope(remote.document).ok)return {action:'invalid'};
    if(workspaceFingerprint(local)===workspaceFingerprint(remote.document))return {action:'current',revision:remote.revision};
    if(baseRevision!==remote.revision)return {action:baseFingerprint===workspaceFingerprint(local)?'download':'conflict',revision:remote.revision};
    return {action:'upload',revision:remote.revision};}
  if(baseRevision!==null&&baseRevision!==0)return {action:'conflict',revision:0};
  return {action:'upload',revision:0};
}
export function makeOutbox(userId,envelope,baseRevision) {
  if(typeof userId!=='string'||!userId||!validateEnvelope(envelope).ok||!Number.isSafeInteger(baseRevision)||baseRevision<0)throw Error('Invalid pending workspace.');
  return {version:1,userId,envelope,baseRevision,queuedAt:new Date().toISOString()};
}
export function validateOutbox(value,userId) {
  if(!record(value)||value.version!==1||value.userId!==userId||!Number.isSafeInteger(value.baseRevision)||value.baseRevision<0||!validateEnvelope(value.envelope).ok)return {ok:false,error:'Pending workspace belongs to another account or is invalid.'};
  return {ok:true,value};
}
export function restoreWorkspace(storage,envelope) {
  const result=validateEnvelope(envelope);if(!result.ok)throw Error(result.error);
  const before=new Map(CLOUD_DOCUMENT_KEYS.map(key=>[key,storage.getItem(key)]));
  try{for(const key of CLOUD_DOCUMENT_KEYS){const raw=result.value.documents[key];if(raw===undefined)storage.removeItem(key);else storage.setItem(key,raw);}}
  catch(error){for(const [key,raw]of before){try{if(raw===null)storage.removeItem(key);else storage.setItem(key,raw);}catch{/* preserve original error; user must retain exported backup */}}throw error;}
}
export function isolateAccountWorkspace(storage,owner) {
  const documents={};for(const key of CLOUD_DOCUMENT_KEYS){const raw=storage.getItem(key);if(raw!==null)documents[key]=raw;}
  try{storage.setItem(`bindforge-nw:cloud-quarantine:${owner}`,JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),documents}));}catch{/* Sign-out must work even at storage quota. */}
  try{const recovery=storage.getItem('bindforge-nw:recovery:v1');if(recovery)storage.setItem(`bindforge-nw:cloud-recovery:${owner}`,recovery);}catch{/* Keep account data out of guest recovery UI even at quota. */}
  for(const key of [...CLOUD_DOCUMENT_KEYS,'bindforge-nw:recovery:v1','bindforge-nw:cloud-owner'])storage.removeItem(key);
  storage.removeItem(`bindforge-nw:cloud-meta:${owner}`);
}
