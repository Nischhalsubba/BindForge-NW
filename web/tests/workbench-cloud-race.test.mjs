import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../app/lib/workbench-cloud.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(
  source.replace(/import[\s\S]*?from\s+["'][^"']+["'];/g, ""),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  },
).outputText;
const tick = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
}
async function scenario(action) {
  const values = new Map([
    ["bindforge-nw:cloud-owner", "owner-a"],
    [
      "bindforge-nw:cloud-meta:owner-a",
      JSON.stringify({
        approved: true,
        baseRevision: 2,
        baseFingerprint: "local",
      }),
    ],
  ]);
  const writes = [];
  let restored = false,
    reloaded = false;
  const read = deferred(),
    write = deferred();
  const client = {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "owner-a" } } },
      }),
      getUser: () => read.promise,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => read.promise }) }),
    }),
    rpc: () => write.promise,
  };
  const names = [
    "localStorage",
    "window",
    "navigator",
    "location",
    "setInterval",
    "__cloudTestDependencies",
  ];
  const before = new Map(
    names.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]),
  );
  const install = (k, v) =>
    Object.defineProperty(globalThis, k, {
      value: v,
      writable: true,
      configurable: true,
    });
  install("localStorage", {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      writes.push(k);
      values.set(k, v);
    },
    removeItem: (k) => values.delete(k),
  });
  install("window", { addEventListener() {} });
  install("navigator", { onLine: true });
  install("location", {
    reload: () => {
      reloaded = true;
    },
  });
  install("setInterval", () => 0);
  install("__cloudTestDependencies", {
    getCloudClient: () => client,
    collectWorkspace: () => ({ document: "local" }),
    workspaceFingerprint: () => "local",
    planSync: () => ({ action, revision: 2 }),
    queueLatestDraft: () => ({ baseRevision: 2 }),
    restoreWorkspace: () => {
      restored = true;
    },
    isolateAccountWorkspace() {},
  });
  const adapter = await import(
    "data:text/javascript;base64," +
      Buffer.from(
        "const {getCloudClient,collectWorkspace,workspaceFingerprint,planSync,queueLatestDraft,restoreWorkspace,isolateAccountWorkspace}=globalThis.__cloudTestDependencies;\n" +
          js +
          "\n//" +
          Math.random(),
      ).toString("base64")
  );
  return {
    adapter,
    values,
    writes,
    read,
    write,
    get restored() {
      return restored;
    },
    get reloaded() {
      return reloaded;
    },
    cleanup() {
      for (const [key, descriptor] of before) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}
test("a delayed cloud download cannot restore data after the account changes", async () => {
  const s = await scenario("download");
  try {
    s.adapter.startCloudSync(() => {});
    s.values.set("bindforge-nw:cloud-owner", "owner-b");
    s.read.resolve({ data: { revision: 3, document: {} }, error: null });
    await tick();
    assert.equal(s.restored, false);
    assert.deepEqual(s.writes, []);
  } finally {
    s.cleanup();
  }
});
test("an upload completing after sign-out cannot reattach account metadata", async () => {
  const s = await scenario("upload");
  try {
    s.adapter.startCloudSync(() => {});
    s.read.resolve({ data: { revision: 2, document: {} }, error: null });
    await tick();
    s.writes.length = 0;
    s.values.delete("bindforge-nw:cloud-owner");
    s.write.resolve({ data: 3, error: null });
    await tick();
    assert.deepEqual(s.writes, []);
  } finally {
    s.cleanup();
  }
});
test("owner verification rejects a change made while server verification is pending", async () => {
  const s = await scenario("current");
  try {
    const check = s.adapter.verifyWorkspaceOwner();
    await tick();
    s.values.set("bindforge-nw:cloud-owner", "owner-b");
    s.read.resolve({ data: { user: { id: "owner-a" } }, error: null });
    await assert.rejects(check, /Account changed/);
    assert.equal(s.reloaded, true);
  } finally {
    s.cleanup();
  }
});
