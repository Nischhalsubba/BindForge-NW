"use client";

import { useMemo, useState } from "react";
import { binds } from "./binds";
import type { Bind } from "./binds";

const categories = ["All", ...Array.from(new Set(binds.map((bind) => bind.category)))];
const priorities = ["All", "Core", "Optional", "Reset"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [copied, setCopied] = useState("");

  const filteredBinds = useMemo(() => {
    const search = normalize(query);

    return binds.filter((bind) => {
      const matchesCategory = category === "All" || bind.category === category;
      const matchesPriority = priority === "All" || bind.priority === priority;
      const haystack = normalize(
        `${bind.category} ${bind.title} ${bind.keys} ${bind.command} ${bind.note} ${bind.priority}`,
      );

      return matchesCategory && matchesPriority && (!search || haystack.includes(search));
    });
  }, [category, priority, query]);

  const categoryCounts = useMemo(
    () =>
      categories.reduce<Record<string, number>>((totals, item) => {
        totals[item] =
          item === "All" ? binds.length : binds.filter((bind) => bind.category === item).length;
        return totals;
      }, {}),
    [],
  );

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  function copyBind(bind: Bind) {
    return copyText(bind.command, bind.title);
  }

  function copyVisible() {
    return copyText(filteredBinds.map((bind) => bind.command).join("\n"), "visible list");
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setPriority("All");
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#171717]">
      <section className="border-b border-[#d6dad2] bg-[#ffffff]">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
          <div className="flex min-w-0 flex-col justify-end gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-[#8f1f1f]">
              <span className="border border-[#d94a2b] bg-[#fff4ef] px-2 py-1">Neverwinter</span>
              <span className="border border-[#d9a441] bg-[#fff8e7] px-2 py-1">Keybind Library</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-[#171717] sm:text-5xl">
                BindForge NW
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#555d57]">
                A compact command table for one-click copying Neverwinter keybinds.
              </p>
            </div>
          </div>

          <div className="border border-[#cbd2ca] bg-[#f9faf7] p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border border-[#d6dad2] bg-white px-3 py-3">
                <div className="text-2xl font-semibold">{binds.length}</div>
                <div className="mt-1 text-xs font-bold uppercase text-[#69736b]">Total</div>
              </div>
              <div className="border border-[#d6dad2] bg-white px-3 py-3">
                <div className="text-2xl font-semibold">{filteredBinds.length}</div>
                <div className="mt-1 text-xs font-bold uppercase text-[#69736b]">Shown</div>
              </div>
              <div className="border border-[#d6dad2] bg-white px-3 py-3">
                <div className="text-2xl font-semibold">{categories.length - 1}</div>
                <div className="mt-1 text-xs font-bold uppercase text-[#69736b]">Groups</div>
              </div>
            </div>
            <button
              className="mt-3 h-11 w-full border border-[#171717] bg-[#171717] px-4 text-sm font-bold text-white transition hover:bg-[#343434] disabled:cursor-not-allowed disabled:border-[#a4aaa4] disabled:bg-[#a4aaa4]"
              disabled={filteredBinds.length === 0}
              onClick={copyVisible}
              type="button"
            >
              Copy visible commands
            </button>
            <div className="mt-2 min-h-5 text-sm text-[#5f695f]" role="status">
              {copied ? `Copied ${copied}.` : ""}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="border border-[#cbd2ca] bg-white p-3">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase text-[#647066]">Search</span>
              <input
                className="h-11 w-full border border-[#bfc8bd] bg-[#fbfcfa] px-3 text-sm outline-none transition placeholder:text-[#7a847b] focus:border-[#8f1f1f]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Key, command, purpose"
                value={query}
              />
            </label>
          </div>

          <div className="border border-[#cbd2ca] bg-white p-3">
            <div className="mb-2 text-xs font-bold uppercase text-[#647066]">Category</div>
            <div className="grid gap-2">
              {categories.map((item) => (
                <button
                  className={`flex h-10 items-center justify-between border px-3 text-left text-sm font-semibold transition ${
                    category === item
                      ? "border-[#8f1f1f] bg-[#8f1f1f] text-white"
                      : "border-[#d6dad2] bg-[#fbfcfa] text-[#242724] hover:border-[#8f1f1f]"
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  <span>{item}</span>
                  <span className={category === item ? "text-white" : "text-[#69736b]"}>
                    {categoryCounts[item]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-[#cbd2ca] bg-white p-3">
            <div className="mb-2 text-xs font-bold uppercase text-[#647066]">Type</div>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((item) => (
                <button
                  className={`h-10 border px-3 text-sm font-semibold transition ${
                    priority === item
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#d6dad2] bg-[#fbfcfa] hover:border-[#171717]"
                  }`}
                  key={item}
                  onClick={() => setPriority(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            className="h-10 w-full border border-[#bfc8bd] bg-transparent px-3 text-sm font-bold text-[#323832] transition hover:border-[#171717]"
            onClick={clearFilters}
            type="button"
          >
            Reset filters
          </button>
        </aside>

        <section className="min-w-0">
          {filteredBinds.length > 0 ? (
            <div className="grid gap-3">
              {filteredBinds.map((bind) => (
                <article
                  className="grid gap-4 border border-[#cbd2ca] bg-white p-4 shadow-[0_1px_0_rgba(23,23,23,0.04)] md:grid-cols-[150px_1fr_auto] md:items-center"
                  key={`${bind.category}-${bind.title}`}
                >
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-[#8f1f1f]">
                      {bind.category}
                    </div>
                    <div className="inline-flex min-h-10 items-center border border-[#bfc8bd] bg-[#eef2ed] px-3 font-mono text-sm font-semibold text-[#1d221e]">
                      {bind.keys}
                    </div>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#171717]">{bind.title}</h2>
                      <span className="border border-[#d9a441] bg-[#fff8e7] px-2 py-1 text-xs font-bold uppercase text-[#72530f]">
                        {bind.priority}
                      </span>
                    </div>
                    <code className="block overflow-x-auto border border-[#d6dad2] bg-[#f9faf7] px-3 py-3 font-mono text-sm text-[#262b27]">
                      {bind.command}
                    </code>
                    <p className="text-sm leading-6 text-[#59645b]">{bind.note}</p>
                  </div>

                  <button
                    className="h-11 border border-[#171717] px-5 text-sm font-bold transition hover:bg-[#171717] hover:text-white md:w-24"
                    onClick={() => copyBind(bind)}
                    type="button"
                  >
                    Copy
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-[#cbd2ca] bg-white p-8 text-center">
              <h2 className="text-xl font-semibold">No matching binds</h2>
              <p className="mt-2 text-sm text-[#59645b]">Change the search or reset filters.</p>
              <button
                className="mt-5 h-10 border border-[#171717] px-4 text-sm font-bold transition hover:bg-[#171717] hover:text-white"
                onClick={clearFilters}
                type="button"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
