"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { observedWorkingBindFragments, verifiedActionCategories, verifiedKeybindActions } from "../data/verifiedKeybindActions";
import { buildCommandChain, sanitizeBindFragment, validateCustomFragment } from "../lib/command-chain.mjs";
import { isCompleteCombo } from "../lib/keybind-core.mjs";
import type { CopyResultState } from "../lib/copy-types";
import { Icon } from "./Icon";
import { KeyCaptureInput } from "./KeyCaptureInput";
import styles from "./VerifiedBindBuilder.module.css";

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type ChainItem = {
  instanceId: number;
  label: string;
  fragment: string;
  source: "settings-screenshot" | "user-provided-working-bind" | "custom";
};

export function VerifiedBindBuilder({ onCopy }: { onCopy: CopyHandler }) {
  const [keyValue, setKeyValue] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [chain, setChain] = useState<ChainItem[]>([]);
  const [past, setPast] = useState<ChainItem[][]>([]);
  const [future, setFuture] = useState<ChainItem[][]>([]);
  const [draftReady, setDraftReady] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");
  const [saved, setSaved] = useState<{name:string;key:string;chain:ChainItem[]}[]>([]);
  const [saveName, setSaveName] = useState("");
  const [customFragment, setCustomFragment] = useState("");
  const [customError, setCustomError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copying" | CopyResultState>("idle");
  const nextId = useRef(1);
  const preview = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
    try {
      const stored=localStorage.getItem("bindforge-nw:builder:v1");
      const raw = JSON.parse(stored || "null");
      const validChain = (items: unknown): items is ChainItem[] => Array.isArray(items) && items.length <= 100 && items.every(x => x && typeof x.label === "string" && typeof x.fragment === "string" && x.fragment.length <= 2000 && Number.isSafeInteger(x.instanceId) && ["custom","settings-screenshot","user-provided-working-bind"].includes(x.source));
      if (raw?.version === 1 && typeof raw.key === "string" && validChain(raw.chain)) {
        setKeyValue(raw.key); setChain(raw.chain);
        const restoredPast=Array.isArray(raw.past)?raw.past.filter(validChain).slice(-50):[];
        const restoredFuture=Array.isArray(raw.future)?raw.future.filter(validChain).slice(0,50):[];
        setPast(restoredPast);setFuture(restoredFuture);
        nextId.current = Math.max(0,...[raw.chain,...restoredPast,...restoredFuture].flat().map((x:ChainItem)=>x.instanceId)) + 1;
        if(Array.isArray(raw.saved)) setSaved(raw.saved.filter((x:{name:string;key:string;chain:unknown})=>typeof x.name === "string" && typeof x.key === "string" && validChain(x.chain)).slice(0,30));
      } else if(stored){setDraftStatus("Saved draft is unreadable and has been preserved. Export your workspace before replacing it.");return;}
    } catch { setDraftStatus("The saved draft could not be read and has been preserved.");return; }
    setDraftReady(true);
    },0);
    return ()=>clearTimeout(timer);
  }, []);
  useEffect(() => {
    if(!draftReady) return;
    try { localStorage.setItem("bindforge-nw:builder:v1", JSON.stringify({version:1,key:keyValue,chain,saved,past,future})); }
    catch { const timer=setTimeout(()=>setDraftStatus("Draft could not be saved on this browser. Copy or export your work before leaving."),0); return ()=>clearTimeout(timer); }
  }, [draftReady,keyValue,chain,saved,past,future]);
  function updateChain(next: ChainItem[] | ((items:ChainItem[])=>ChainItem[])) {
    const value=typeof next === "function" ? next(chain) : next;
    if(value.length>100){setDraftStatus("A combination can contain up to 100 actions.");return;}
    setPast(items=>[...items,chain].slice(-50)); setFuture([]);
    setChain(value);
  }
  function undo(){const previous=past.at(-1);if(!previous)return;setFuture(items=>[chain,...items]);setPast(items=>items.slice(0,-1));setChain(previous);}
  function redo(){const next=future[0];if(!next)return;setPast(items=>[...items,chain]);setFuture(items=>items.slice(1));setChain(next);}

  const filteredActions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return verifiedKeybindActions.filter((action) => {
      const matchesCategory = category === "All" || action.category === category;
      const haystack = `${action.label} ${action.manualCommand} ${action.bindFragment} ${action.category}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }, [category, search]);

  const line = buildCommandChain(keyValue, chain.map((item) => item.fragment));
  const canCopy = Boolean(isCompleteCombo(keyValue) && chain.length);

  function addItem(label: string, fragment: string, source: ChainItem["source"]) {
    updateChain((current) => [...current, { instanceId: nextId.current++, label, fragment, source }]);
    setCopyState("idle");
  }

  function moveItem(index: number, direction: -1 | 1) {
    updateChain((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setCopyState("idle");
  }

  function removeItem(instanceId: number) {
    updateChain((current) => current.filter((item) => item.instanceId !== instanceId));
    setCopyState("idle");
  }

  function addCustom() {
    if(customFragment.length>2000){setCustomError("Use at most 2,000 characters per action.");return;}
    const validation = validateCustomFragment(customFragment);
    if (!validation.ok) {
      setCustomError(validation.message);
      return;
    }
    const fragment = sanitizeBindFragment(customFragment);
    addItem("Custom fragment", fragment, "custom");
    setCustomFragment("");
    setCustomError("");
  }

  function reset() {
    setKeyValue("");
    setSearch("");
    setCategory("All");
    updateChain([]);
    setCustomFragment("");
    setCustomError("");
    setCopyState("idle");
  }

  async function copyLine() {
    if (!canCopy) return;
    setCopyState("copying");
    const result = await onCopy(line, "combined keybind", preview.current);
    setCopyState(result);
  }

  const copyLabel = copyState === "copying"
    ? "Copying…"
    : copyState === "copied" || copyState === "fallback"
      ? "Copied"
      : copyState === "error"
        ? "Try again"
        : "Copy keybind";

  return (
    <section className={styles.builder} id="verified-bind-builder" aria-labelledby="verified-bind-builder-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Verified custom builder</p>
          <h2 id="verified-bind-builder-title">Compose your own keybind</h2>
          <p className={styles.intro}>Choose a key, add verified actions, arrange them in the order you want, and copy the finished Neverwinter bind. The builder inserts the <code>$$</code> separators automatically.</p>
        </div>
        <div className={styles.verificationBadge}><Icon name="shield" /><span><strong>{verifiedKeybindActions.length}</strong> screenshot-verified actions</span></div>
      </header>

      <div className={styles.previewActions}>
        <button type="button" disabled={!past.length} onClick={undo}>Undo action change</button>
        <button type="button" disabled={!future.length} onClick={redo}>Redo action change</button>
        <label>Combination name <input value={saveName} maxLength={80} onChange={event=>setSaveName(event.target.value)} /></label>
        <button type="button" disabled={!chain.length||!saveName.trim()||saved.length>=30} onClick={()=>{setSaved(items=>[...items,{name:saveName.trim(),key:keyValue,chain}]);setSaveName("");}}>Save reusable combination</button>
      </div>
      {saved.length ? <details className={styles.advanced}><summary>Reusable combinations ({saved.length})</summary>{saved.map((item,index)=><div key={index} className={styles.previewActions}><button type="button" onClick={()=>{updateChain(item.chain.map(x=>({...x,instanceId:nextId.current++})));setKeyValue(item.key);}}>Load {item.name}</button><button type="button" onClick={()=>setSaved(items=>items.filter((_,i)=>i!==index))}>Remove {item.name}</button></div>)}</details>:null}
      {draftStatus?<p role="status">{draftStatus}</p>:null}
      <div className={styles.keyAndPreview}>
        <section className={styles.keyPanel} aria-labelledby="bind-key-title">
          <div className={styles.panelHeading}>
            <span>01</span>
            <div><h3 id="bind-key-title">Choose a key</h3><p>Press a keyboard key or mouse button, or enter the exact Neverwinter key token.</p></div>
          </div>
          <KeyCaptureInput
            aria-label="Key for combined Neverwinter bind"
            autoComplete="off"
            hint="Press the first key, then +, then the next key to merge them. Held Ctrl / Alt / Shift modifiers also merge automatically, for example Ctrl+5 or Ctrl+Left Click. + is only the separator and is never assigned by itself."
            onValueChange={(value) => { setKeyValue(value); setCopyState("idle"); }}
            placeholder="Press a key, then + to add another"
            value={keyValue}
          />
          <div className={styles.quickKeys}>
            <button onClick={() => { setKeyValue("lbutton"); setCopyState("idle"); }} type="button">Left mouse <code>lbutton</code></button>
            <button onClick={() => { setKeyValue("rbutton"); setCopyState("idle"); }} type="button">Right mouse <code>rbutton</code></button>
            <button onClick={() => { setKeyValue("mbutton"); setCopyState("idle"); }} type="button">Middle mouse <code>mbutton</code></button>
            <small><Icon name="check" /> Mouse capture works after a <code>+</code> separator too, so combinations can include keyboard and mouse inputs.</small>
          </div>
        </section>

        <section className={styles.previewPanel} aria-labelledby="bind-preview-title">
          <div className={styles.panelHeading}>
            <span>03</span>
            <div><h3 id="bind-preview-title">Generated bind</h3><p>The preview becomes copy-ready after you finish the key combination and add at least one action.</p></div>
          </div>
          <code className={styles.preview} ref={preview} tabIndex={0}>{line}</code>
          <div className={styles.previewActions}>
            <button className={styles.copyButton} disabled={!canCopy || copyState === "copying"} onClick={() => { void copyLine(); }} type="button"><Icon name="copy" /> {copyLabel}</button>
            <button className={styles.resetButton} onClick={reset} type="button"><Icon name="reset" /> Reset builder</button>
          </div>
          <p className={styles.syntaxNote}>Actions are emitted in the order shown, wrapped in quotes, and joined with <code>$$</code>. Custom fragments stay clearly marked as unverified.</p>
        </section>
      </div>

      <div className={styles.composeGrid}>
        <section className={styles.catalogPanel} aria-labelledby="verified-actions-title">
          <div className={styles.panelHeading}>
            <span>02</span>
            <div><h3 id="verified-actions-title">Add verified actions</h3><p>Search the action name or command, then click an action to add it to your bind.</p></div>
          </div>
          <div className={styles.filters}>
            <label><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search actions or commands" /></label>
            <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{verifiedActionCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className={styles.resultMeta}><span>{filteredActions.length} actions shown</span><span>Duplicates allowed</span></div>
          <div className={styles.actionList}>
            {filteredActions.map((action) => (
              <button className={styles.actionRow} key={action.id} onClick={() => addItem(action.label, action.bindFragment, "settings-screenshot")} type="button">
                <span><strong>{action.label}</strong><small>{action.category}</small></span>
                <code>{action.bindFragment}</code>
                <b aria-hidden="true">+</b>
              </button>
            ))}
            {!filteredActions.length ? <p className={styles.empty}>No verified action matches those filters. Try a different term or category.</p> : null}
          </div>
        </section>

        <section className={styles.chainPanel} aria-labelledby="command-chain-title">
          <div className={styles.panelHeading}>
            <span>→</span>
            <div><h3 id="command-chain-title">Your action order</h3><p>Neverwinter receives these fragments from top to bottom.</p></div>
          </div>
          <ol className={styles.chainList}>
            {chain.map((item, index) => (
              <li key={item.instanceId}>
                <span className={styles.order}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.chainIdentity}><strong>{item.label}</strong><code>{item.fragment}</code><small data-source={item.source}>{item.source === "settings-screenshot" ? "Screenshot verified" : item.source === "user-provided-working-bind" ? "Observed working bind" : "Custom / unverified"}</small></span>
                <span className={styles.chainActions}>
                  <button aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => moveItem(index, -1)} type="button"><Icon name="arrow-up" /></button>
                  <button aria-label={`Move ${item.label} down`} disabled={index === chain.length - 1} onClick={() => moveItem(index, 1)} type="button"><Icon name="arrow-down" /></button>
                  <button aria-label={`Duplicate ${item.label}`} onClick={() => updateChain(items=>[...items.slice(0,index+1),{...item,instanceId:nextId.current++},...items.slice(index+1)])} type="button">Duplicate</button>
                  <button aria-label={`Remove ${item.label}`} onClick={() => removeItem(item.instanceId)} type="button"><Icon name="close" /></button>
                </span>
              </li>
            ))}
          </ol>
          {!chain.length ? <div className={styles.chainEmpty}><Icon name="code" /><strong>No actions added yet</strong><span>Choose an action from the verified list to start your bind.</span></div> : null}

          <details className={styles.advanced}>
            <summary>Advanced exact fragment</summary>
            <p>Use this only when you already know the exact fragment. Custom values remain separate from screenshot-verified actions and are never presented as verified.</p>
            <div className={styles.customRow}>
              <input aria-label="Exact custom bind fragment" value={customFragment} onChange={(event) => { setCustomFragment(event.target.value); setCustomError(""); }} placeholder="Example: ++actionleft" />
              <button onClick={addCustom} type="button">Add exact fragment</button>
            </div>
            {customError ? <p className={styles.error} role="alert">{customError}</p> : null}
            <div className={styles.observed}>
              <span>Observed in supplied working bind:</span>
              {observedWorkingBindFragments.map((item) => <button key={item.id} onClick={() => addItem(item.label, item.fragment, "user-provided-working-bind")} type="button"><code>{item.fragment}</code></button>)}
            </div>
          </details>
        </section>
      </div>
    </section>
  );
}
