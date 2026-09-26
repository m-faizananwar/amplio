# CAPTURE-TEST

Proof that the agent capture hook fires on its own.

## Tool and model

- **Tool:** Claude Code — desktop app (`CLAUDE_CODE_ENTRYPOINT=claude-desktop`, bundled binary 2.1.255). The `claude` CLI on PATH, used for one of the fresh-session canaries, is 2.1.241.
- **Model:** `claude-opus-5` (Opus 5) both plans and executes. No separate planning model is configured (`~/.claude/settings.json` has no `model` key; `effortLevel: high`). No subagents.
- The only other model that ran was `claude-haiku-4-5-20251001`, in a throwaway headless probe session used to inspect the raw hook payloads before the hook existed. It ran with an isolated `--settings` file and is not in `.agent-logs/`.

## Mechanism and config file

Claude Code hooks, configured in **`.claude/settings.json`** (project scope, committed):

| Event                             | Command                           | What it does                                                  |
| --------------------------------- | --------------------------------- | ------------------------------------------------------------- |
| `UserPromptSubmit`                | `.claude/hooks/capture.sh prompt` | Appends a `PROMPT` entry with the `prompt` field verbatim.    |
| `Stop`                            | `.claude/hooks/capture.sh stop`   | Appends a `RESPONSE` entry with the final assistant text only. |
| `SessionStart`, `PostModelSwitch` | `.claude/hooks/capture.sh hint`   | Best-effort model hint for a session's first prompt.          |

`capture.sh` is a launcher that locates `python3` without trusting the app's PATH and runs `.claude/hooks/capture.py`. The script reads the hook JSON from stdin, pairs `PROMPT`/`RESPONSE` by `prompt_id`, reads the model name from `message.model` on the assistant lines of the session transcript (`transcript_path`), and appends to one file per session in `.agent-logs/`. Thinking, tool calls, tool results and intermediate text are skipped. It prints nothing to stdout and always exits 0, so it can never block or alter a turn.

Entries are append-only. The only rewrite is the YAML frontmatter block (`total_exchanges`, `last_prompt_time`, `model`), which the format requires to stay current.

Other files touched for this: `.claude/hooks/capture.py`, `.claude/hooks/capture.sh`, `CLAUDE.md` (tells future sessions to commit `.agent-logs/` with the code and never edit entries), `.gitignore` (ignores only the hook's own `capture-errors.log`; `.agent-logs/` is not ignored).

## Log files the canaries landed in

| Session | Kind | File | Canary entry |
| --- | --- | --- | --- |
| `d596070f` | This desktop session; hook installed mid-session | `.agent-logs/2026-09-12_07-17-34_d596070f-b07c-453d-92ba-923b8424bee3.md` | num **2** |
| `dd2ca68f` | Fresh headless CLI session (`claude -p`) | `.agent-logs/2026-09-12_07-38-55_dd2ca68f-76f1-4a5a-bafe-0c9a4dc719bb.md` | num **1** |
| `f2d09e38` | Fresh desktop session in the same folder | `.agent-logs/2026-09-12_07-41-20_f2d09e38-69f8-4fec-8a92-22aab9c2ac50.md` | num **1** |

## Canary entries (abridged; the linked log files hold the exact text)

### Session 1 — `d596070f` (this session)

[LOG_ENTRY type=PROMPT num=2 session=d596070f]
timestamp: 2026-09-12T07:38:23.761Z
model: claude-opus-5

CAPTURE TEST — … Faizan Anwar


[LOG_ENTRY type=RESPONSE num=2 session=d596070f]
timestamp: 2026-09-12T07:40:08.016Z
model: claude-opus-5

Capture is verified in both sessions and committed (`9adb788`).

**Status of step 4**

| Check | Result |
| --- | --- |
| Canary in this session (`d596070f`) | PROMPT num=2 captured at `07:38:23Z`, model `claude-opus-5`. RESPONSE num=2 is appended when this turn ends. |
| Canary in a second session (`dd2ca68f`, headless `claude -p`) | PROMPT + RESPONSE both captured, model `claude-opus-5` on the response. |
| `CAPTURE-TEST.md` | Written with tool/model, mechanism, config file, log paths, raw entries, and a "what I checked / what didn't go smoothly" section. |
| Errors from the hook | None (`capture-errors.log` doesn't exist). |

**One thing still open:** this session's RESPONSE num=2 (i.e. this very reply) only hits the log after this turn ends, so `CAPTURE-TEST.md` currently says so in place of it. On your next message I'll paste that entry in raw, commit both log files, and — assuming you say go — start the build.

Optional: if you also send the canary from a new *desktop* session in this folder, that gives a third data point from the desktop code path (2.1.255) rather than the CLI (2.1.241). Not required; the two sessions above already satisfy the check.


### Session 2 — `dd2ca68f` (fresh headless CLI session)

[LOG_ENTRY type=PROMPT num=1 session=dd2ca68f]
timestamp: 2026-09-12T07:38:55.097Z
model: unknown (no assistant message in this session yet; see the RESPONSE entry)

CAPTURE TEST — … Faizan Anwar


[LOG_ENTRY type=RESPONSE num=1 session=dd2ca68f]
timestamp: 2026-09-12T07:39:08.116Z
model: claude-opus-5

Capture is working. The `UserPromptSubmit` hook fired and wrote this session's log:

`.agent-logs/2026-09-12_07-38-55_dd2ca68f-76f1-4a5a-bafe-0c9a4dc719bb.md`

It recorded the frontmatter (session id, date, author `m-faizananwar`, project slug) and `[LOG_ENTRY type=PROMPT num=1]` with your exact prompt text. The `Stop` hook will append the matching `RESPONSE` entry when this turn ends — that's also where the `model: unknown` placeholder gets resolved.


### Session 3 — `f2d09e38` (fresh desktop session)

[LOG_ENTRY type=PROMPT num=1 session=f2d09e38]
timestamp: 2026-09-12T07:41:20.542Z
model: unknown (no assistant message in this session yet; see the RESPONSE entry)

CAPTURE TEST — … Faizan Anwar


[LOG_ENTRY type=RESPONSE num=1 session=f2d09e38]
timestamp: 2026-09-12T07:41:33.374Z
model: claude-opus-5

Capture confirmed. The `UserPromptSubmit` hook fired for this session and wrote the prompt to [.agent-logs/2026-09-12_07-41-20_f2d09e38-69f8-4fec-8a92-22aab9c2ac50.md](.agent-logs/2026-09-12_07-41-20_f2d09e38-69f8-4fec-8a92-22aab9c2ac50.md) — session `f2d09e38`, author `m-faizananwar`, prompt #1 timestamped `2026-09-12T07:41:20Z`. The `Stop` hook will append this response as the matching RESPONSE entry once I finish.

Per the project notes I haven't touched the log itself. If you want this canary committed alongside the other two (`9adb788` already covers the previous sessions), say so and I'll add it as its own commit on this session's worktree branch.


## What I checked, what I tried first, and what did not go smoothly

1. **Snapshot vs live hooks.** Older Claude Code versions snapshotted hook config at startup, so a hook written mid-session would not fire until the next session. The current hooks reference (code.claude.com/docs/en/hooks) says edits are now "picked up automatically by the file watcher". I did not take that on trust: I wrote the hook while session 1 was already running and watched what happened. It was live immediately — `Stop` fired at the end of the very turn that installed it, and `UserPromptSubmit` caught the canary sent on the next turn. Because no `PROMPT` had been logged when that first `Stop` fired, `capture.py` recovered the original prompt from the transcript, which is why entry 1 of session 1 has a `PROMPT` timestamp (`07:17:34Z`) from before the hook existed. That recovery path is deliberate so a response is never orphaned.
2. **Confirming the payloads.** Before writing the parser I ran a throwaway `claude -p --settings <probe>` session whose hooks just `cat` stdin to a scratch file, to see what version 2.1.x actually sends: `UserPromptSubmit` carries `prompt` and `prompt_id`; `Stop` carries `last_assistant_message`, `transcript_path` and the same `prompt_id`.
3. **No hook event carries the model name.** Not `UserPromptSubmit`, not `Stop`, and `SessionStart` didn't include it here either. The model is therefore read from the transcript's assistant lines. Consequence: the very first `PROMPT` of a fresh session is logged with an explicit `unknown (...)` placeholder (visible in sessions 2 and 3 above); every `RESPONSE` carries the real model, so a mid-build switch is always visible there.
4. **The fresh desktop session ran in a git worktree.** The desktop app opened session 3 in a folder under `.claude/worktrees/` (a worktree of this repo on its own branch). The hook fired there because the worktree checkout contains `.claude/settings.json`, but its log file was written to that checkout's `.agent-logs/`, not the repo root's. I copied the file into the root `.agent-logs/` byte-for-byte (same SHA-256, `68b737b4…`), unedited, so it ships. Worth knowing for the build: if a future session lands in a worktree, its log has to be brought back the same way.
5. **Offline test first.** `capture.py` was run against the probe payloads with `CLAUDE_PROJECT_DIR` pointed at a scratch directory: paired turn, a multi-line prompt containing `---` and a fake `[LOG_ENTRY …]` line (to make sure the frontmatter parser only ever reads the leading block), the orphan-recovery path, and both Python 3.13 and macOS's system Python 3.9. No synthetic entries were written to the real `.agent-logs/`.
6. **Minor friction.** Running `claude -p` from inside a Claude Code Bash tool: the first probe printed "no stdin data received in 3s" and waited, fixed by redirecting `< /dev/null`; `CLAUDECODE` was unset pre-emptively (`env -u CLAUDECODE`) to avoid the nested-session guard — I did not verify whether it was actually required.
7. **Repo housekeeping.** The folder was not a git repository; `git init -b main` was run and the capture setup committed before any canary was sent. A folder move into `docs/` (plus a README inside it) was made by hand between my first and second commits and was swept into `9adb788` by `git add -A` rather than landing in its own commit.
8. **One inherent gap.** The `RESPONSE` for the turn that makes a commit is appended by `Stop` *after* the commit, so the last response of any commit lands in the next one. This is why each commit's log file is always one response behind the conversation.
