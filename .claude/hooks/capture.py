#!/usr/bin/env python3
"""
Agent capture hook: writes each coding-agent session to .agent-logs/

Wired from .claude/settings.json to fire automatically on every turn:

  UserPromptSubmit  -> `capture.py prompt`   appends a PROMPT entry (verbatim prompt)
  Stop              -> `capture.py stop`     appends a RESPONSE entry (final reply only)
  SessionStart /
  PostModelSwitch   -> `capture.py hint`     records a model hint for the first turn

Writes one Markdown file per session to .agent-logs/ in the repo root:

  .agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md

Only the prompt and the final response of each turn are captured. Thinking,
tool calls, tool results and intermediate text are deliberately left out.

Entries are append-only. The only thing rewritten after the fact is the YAML
frontmatter block at the top of the file (total_exchanges / last_prompt_time /
model), because the format requires those counters to be current.

The hook must never block or alter the agent: it reads stdin, writes to disk,
prints nothing to stdout, and always exits 0. Errors go to
.claude/hooks/capture-errors.log.
"""
import datetime
import glob
import json
import os
import sys

AUTHOR = "m-faizananwar"          # GitHub handle
TOOL = "claude-code"
PROJECT = "amplio"                # project slug for the log frontmatter
UNKNOWN_MODEL = "unknown (no assistant message in this session yet; see the RESPONSE entry)"


# ----------------------------------------------------------------------------
# small helpers
# ----------------------------------------------------------------------------

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


def iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + "%03dZ" % (dt.microsecond // 1000)


def parse_iso(s):
    try:
        return datetime.datetime.strptime(s, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=datetime.timezone.utc)
    except Exception:
        return None


def repo_root(data):
    root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    return os.path.abspath(root)


def state_path(session_id):
    d = os.path.join(os.path.expanduser("~"), ".claude", "agent-capture-state")
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, session_id + ".json")


def load_state(session_id):
    try:
        with open(state_path(session_id), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_state(session_id, state):
    with open(state_path(session_id), "w", encoding="utf-8") as f:
        json.dump(state, f)


def log_error(root, msg):
    try:
        p = os.path.join(root, ".claude", "hooks", "capture-errors.log")
        with open(p, "a", encoding="utf-8") as f:
            f.write("%s %s\n" % (iso(utc_now()), msg))
    except Exception:
        pass


# ----------------------------------------------------------------------------
# transcript reading (~/.claude/projects/<slug>/<session-id>.jsonl)
# ----------------------------------------------------------------------------

def read_transcript(path):
    entries = []
    if not path:
        return entries
    path = os.path.expanduser(path)
    if not os.path.exists(path):
        return entries
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except Exception:
                continue
    return [e for e in entries if isinstance(e, dict) and not e.get("isSidechain")]


def text_blocks(content):
    """Text of a message content field, skipping thinking / tool_use / tool_result."""
    if isinstance(content, str):
        return content
    parts = []
    if isinstance(content, list):
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
    return "\n".join(parts)


def is_real_user_prompt(e):
    if e.get("type") != "user" or e.get("isMeta"):
        return False
    content = (e.get("message") or {}).get("content")
    if isinstance(content, str):
        return True
    if isinstance(content, list):
        return any(isinstance(b, dict) and b.get("type") == "text" for b in content) and not any(
            isinstance(b, dict) and b.get("type") == "tool_result" for b in content)
    return False


def last_assistant_model(entries):
    for e in reversed(entries):
        if e.get("type") == "assistant":
            m = (e.get("message") or {}).get("model")
            if m:
                return m
    return None


def final_response_from_transcript(entries):
    """Concatenated text blocks of the assistant lines after the last user line.

    Anything after the last user line (the prompt itself, or the last tool
    result) is by definition the final reply of the turn; everything before it
    is intermediate and is skipped.
    """
    last_user = -1
    for i, e in enumerate(entries):
        if e.get("type") == "user":
            last_user = i
    parts = []
    for e in entries[last_user + 1:]:
        if e.get("type") == "assistant":
            t = text_blocks((e.get("message") or {}).get("content"))
            if t:
                parts.append(t)
    return "\n\n".join(parts)


def find_user_prompt(entries, prompt_id):
    """Recover a prompt from the transcript (used only when the PROMPT hook did not run)."""
    candidates = [e for e in entries if is_real_user_prompt(e)]
    if prompt_id:
        for e in reversed(candidates):
            if e.get("promptId") == prompt_id:
                return e
    return candidates[-1] if candidates else None


# ----------------------------------------------------------------------------
# log file management
# ----------------------------------------------------------------------------

FM_KEYS = ["session_id", "date", "author", "model", "tool", "project",
           "total_exchanges", "first_prompt_time", "last_prompt_time"]


def logs_dir(root):
    d = os.path.join(root, ".agent-logs")
    os.makedirs(d, exist_ok=True)
    return d


def find_log(root, session_id):
    matches = sorted(glob.glob(os.path.join(logs_dir(root), "*_%s.md" % session_id)))
    return matches[0] if matches else None


def create_log(root, session_id, first_ts):
    dt = parse_iso(first_ts) or utc_now()
    name = dt.strftime("%Y-%m-%d_%H-%M-%S") + "_" + session_id + ".md"
    path = os.path.join(logs_dir(root), name)
    fm = {
        "session_id": session_id,
        "date": dt.strftime("%Y-%m-%d"),
        "author": AUTHOR,
        "model": "unknown",
        "tool": TOOL,
        "project": PROJECT,
        "total_exchanges": "0",
        "first_prompt_time": first_ts,
        "last_prompt_time": first_ts,
    }
    body = (
        "\n# Session Log - %s\n\n"
        "Session: `%s` | Project: `%s` | Author: `%s`\n\n---\n\n"
        % (fm["date"], session_id[:8], PROJECT, AUTHOR)
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(render_frontmatter(fm) + body)
    return path


def render_frontmatter(fm):
    return "---\n" + "".join("%s: %s\n" % (k, fm.get(k, "")) for k in FM_KEYS) + "---\n"


def split_frontmatter(text):
    """Return (fm_dict, rest_of_file). Only the leading block is parsed, so prompt
    bodies that happen to contain '---' lines are never mistaken for it."""
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end < 0:
        return {}, text
    fm = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm, text[end + len("\n---\n"):]


def read_frontmatter(path):
    with open(path, "r", encoding="utf-8") as f:
        fm, _ = split_frontmatter(f.read())
    return fm


def update_frontmatter(path, updates):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    fm, rest = split_frontmatter(text)
    fm.update(updates)
    with open(path, "w", encoding="utf-8") as f:
        f.write(render_frontmatter(fm) + rest)


def append_entry(path, kind, num, session_id, ts, model, body):
    entry = (
        "[LOG_ENTRY type=%s num=%d session=%s]\n"
        "timestamp: %s\n"
        "model: %s\n\n"
        "%s\n\n\n" % (kind, num, session_id[:8], ts, model, body)
    )
    with open(path, "a", encoding="utf-8") as f:
        f.write(entry)


def write_prompt(root, session_id, prompt_id, prompt, ts, model, state):
    path = find_log(root, session_id) or create_log(root, session_id, ts)
    fm = read_frontmatter(path)
    num = int(fm.get("total_exchanges") or 0) + 1
    append_entry(path, "PROMPT", num, session_id, ts, model, prompt)
    updates = {"total_exchanges": str(num), "last_prompt_time": ts}
    if not fm.get("first_prompt_time"):
        updates["first_prompt_time"] = ts
    update_frontmatter(path, updates)
    state.update({"last_prompt_id": prompt_id, "last_num": num, "responded": False})
    save_state(session_id, state)
    return path, num


# ----------------------------------------------------------------------------
# hook handlers
# ----------------------------------------------------------------------------

def handle_prompt(root, data):
    session_id = data["session_id"]
    state = load_state(session_id)
    entries = read_transcript(data.get("transcript_path"))
    model = last_assistant_model(entries) or state.get("model_hint") or UNKNOWN_MODEL
    write_prompt(root, session_id, data.get("prompt_id"), data.get("prompt", ""),
                 iso(utc_now()), model, state)


def handle_stop(root, data):
    session_id = data["session_id"]
    prompt_id = data.get("prompt_id")
    state = load_state(session_id)
    entries = read_transcript(data.get("transcript_path"))

    model = last_assistant_model(entries) or state.get("model_hint") or "unknown"

    # Final response: Claude Code hands us `last_assistant_message`; the
    # transcript is the raw source and may contain more than one text block for
    # the same final message, so take whichever is the more complete of the two.
    from_hook = data.get("last_assistant_message") or ""
    from_transcript = final_response_from_transcript(entries)
    response = from_transcript if len(from_transcript) >= len(from_hook) else from_hook
    if not response:
        response = "(the turn ended without a final text response)"

    now = iso(utc_now())
    path = find_log(root, session_id)
    fm = read_frontmatter(path) if path else {}
    total = int(fm.get("total_exchanges") or 0)

    paired = (
        path is not None and total > 0
        and state.get("last_num") == total
        and not state.get("responded")
        and (not prompt_id or state.get("last_prompt_id") == prompt_id)
    )
    if paired:
        num = total
    else:
        # The PROMPT hook did not run for this turn (typically: hooks were
        # installed mid-session). Recover the prompt from the transcript so the
        # response is not orphaned, using the prompt's own transcript timestamp.
        e = find_user_prompt(entries, prompt_id)
        if e is not None:
            prompt = text_blocks((e.get("message") or {}).get("content"))
            ts = e.get("timestamp") or now
        else:
            prompt = "(prompt not captured: the hook was not active when it was sent and it could not be recovered from the transcript)"
            ts = now
        path, num = write_prompt(root, session_id, prompt_id, prompt, ts, model, state)

    append_entry(path, "RESPONSE", num, session_id, now, model, response)
    update_frontmatter(path, {"model": model})
    state.update({"responded": True, "model_hint": model})
    save_state(session_id, state)


def handle_hint(root, data):
    model = data.get("to_model") or data.get("model")
    if model:
        session_id = data["session_id"]
        state = load_state(session_id)
        state["model_hint"] = model
        save_state(session_id, state)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    raw = sys.stdin.read()
    data = {}
    root = os.getcwd()
    try:
        data = json.loads(raw) if raw.strip() else {}
        root = repo_root(data)
        if mode == "prompt":
            handle_prompt(root, data)
        elif mode == "stop":
            handle_stop(root, data)
        elif mode == "hint":
            handle_hint(root, data)
        else:
            log_error(root, "unknown mode %r" % mode)
    except Exception as exc:  # never break the agent because of the logger
        log_error(root, "%s failed: %r (event=%s)" % (mode, exc, data.get("hook_event_name")))
    sys.exit(0)


if __name__ == "__main__":
    main()
