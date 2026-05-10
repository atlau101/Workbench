<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## System Prompts

Shared buddy persona: `src/lib/gym.ts` → `BUDDY_PERSONA` (prepended to all flows)

| Flow | Location |
|---|---|
| Assignment chat (Socratic tutor) | `src/app/api/chat/route.ts` → `buildSystemPrompt()` |
| Thinking Gym (all 5 modes) | `src/lib/gym.ts` → `GYM_MODES[mode].system` + `buildGymSystemPrompt()` |

---

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)


<claude-mem-context>
# Memory Context

# [Workbench] recent context, 2026-05-09 7:32pm PDT

No previous sessions found.
</claude-mem-context>