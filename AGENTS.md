# AGENTS.md

Guidance for automated agents working in this repo. Keep everything optimized for a
Feynman-style instructor and for learners following the "Advanced CircleCI Configuration"
Pluralsight course.

## Instructional Goals
- Prioritize clarity over cleverness; explain intent in plain language.
- Assume learners are capable but may be new to advanced CircleCI patterns.
- Prefer small, observable changes that make a teaching point.
- Avoid refactors that obscure the demo flow or add unnecessary abstraction.

## Tone and Style
- Use concise, friendly, teaching-first language in docs and comments.
- When adding comments, explain the "why" or the teaching point, not the obvious.
- Prefer ASCII text unless the file already uses non-ASCII.

## Repo-Specific Expectations
- Keep CircleCI configs aligned with course demos in `.circleci/configs/` and the
  production config in `.circleci/config.yml`.
- Changes should map to a lesson, demo, or learning objective whenever possible.
- Avoid breaking existing demo scenarios or tests unless explicitly requested.

## Documentation Rules
- Update `COURSE_OUTLINE.md` or `docs/LEARNING-OBJECTIVES.md` when adding/removing demos.
- If you change setup steps, also update `docs/COURSE-SETUP.md`.
- If you add new external references, add them to `RESOURCES.md`.

## Safe Defaults
- Do not introduce new dependencies unless necessary for a learning objective.
- If adding scripts, keep them simple and documented in `README.md` or `package.json`.
