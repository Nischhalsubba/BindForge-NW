# Privacy-safe local analytics contract

BindForge's usage analytics are intentionally **device-local**. They exist to help diagnose workflow friction without creating a user profile or uploading gameplay/keymap contents.

## Storage and transmission

- Events are stored only in this browser's local storage under `bindforge-nw:analytics:v1`.
- BindForge does not silently upload these events.
- Export is an explicit user action from **Local data & backup → Privacy-conscious usage insights**.
- Users can clear the local event log at any time from the same panel.
- The log is bounded so it cannot grow without limit.

## Allowed event names

| Event | Purpose |
| --- | --- |
| `search_performed` | A catalogue search returned one or more results. |
| `zero_result_search` | A catalogue search returned no results and can become a research candidate. |
| `preset_copied` | A catalogue preset was copied. |
| `preset_selected` | A catalogue preset was selected for a pack/workflow. |
| `profile_switched` | The active local character/profile changed. |
| `import_previewed` | A local keymap import reached validation preview. |
| `import_confirmed` | A validated import was explicitly confirmed. |
| `workflow_error` | A coarse workflow failure occurred, such as validation-blocked import, oversized file, or file-read failure. |

## Allowed context fields

Only these coarse string dimensions are accepted:

- `route`
- `className`
- `actionType`
- `presetType`
- `outcome`

Unknown fields are discarded before an event is stored.

## Explicitly excluded data

The analytics contract does **not** allow:

- pasted bind/keymap contents
- generated command contents
- character names
- profile names
- free-text search strings
- filenames
- IP addresses
- cookies
- device identifiers
- account identifiers
- arbitrary free-form metadata

Tests enforce that disallowed fields are removed before storage.

## Derived local metrics

The Settings panel can derive:

- zero-result search count
- workflow-error count
- import previews that were ready
- confirmed imports
- local import drop-off = ready previews − confirmed imports
- popular coarse catalogue dimensions such as class, action type, and preset type

Blocked validation previews are recorded as `workflow_error` and are not counted as ready-import drop-off.

## Safety rule for future analytics

Any new event or context field must be added to the explicit allowlist, documented here, and covered by a test proving sensitive/free-text payloads cannot enter the stored event record. Server-side or third-party telemetry must not be enabled silently under this contract.
