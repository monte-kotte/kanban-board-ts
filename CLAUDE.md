# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Knowledge base (`.kb/`)

The `.kb/` folder is the project's knowledge base. Use it to persist anything
that should survive across sessions and be discoverable by future work:

- **Research** — findings from investigations, spikes, library/API comparisons,
  architecture explorations, or answers to open questions. Save these as they
  are produced, not just on request.
- **Plans** — designs and implementation plans for features or refactors that
  haven't been built yet, including ones that are only partially done.

### Conventions

- Before starting research or planning work, check `.kb/` for existing notes
  on the topic so work isn't duplicated or contradicted.
- Write one file per topic/decision, using descriptive kebab-case filenames
  (e.g. `.kb/research/drag-and-drop-library-comparison.md`,
  `.kb/plans/board-persistence.md`).
- Prefix each file with the date it was written and keep it updated in place
  if the research or plan evolves — don't leave stale duplicates.
- When a plan is completed and implemented, move it to `.kb/plans/done/` (or
  mark it clearly as completed) rather than deleting it, so the history of
  decisions remains in the knowledge base.
- Keep entries factual and concise — this is a reference store, not a diary.
