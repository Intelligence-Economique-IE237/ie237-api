This project is based on [Nitro v3](https://nitro.build), [h3](https://h3.dev/), and [Rolldown](https://rolldown.rs/).

Refer to `node_modules/nitro/dist/docs/README.md` when working on server (your knowledge about Nitro v3 is likely outdated!).

## Project Structure

`server/` contains server-side code with supported subdirs (create as needed): `api/` (/api prefixed handlers), `routes/` (non-prefixed route handlers), `middleware/`, `plugins/`, `utils/`, `assets/`, and `tasks/`. `public/` holds static assets (copied, not bundled). Config files: `nitro.config.ts` (serverDir, routeRules, preset, etc.), `tsconfig.json`.

## Conventions
- Path alias `~/*` (tsconfig), use explicit `.ts` extensions.
- Every feature should be done on a branch prefixed with `f/` to indicate it's a feature
- Every bug fix should be done on a branch prefixed with `b/` to indicate it's a bug-fix
- Documentation markdown files should be in a directory called `docs`
- The platform is called IE237
- Using Nitro framework (https://nitro.build)
- Using Drizzle ORM for database migrations and queries
- Using PostgreSQL as the database.
- Always interact with external services via interfaces/contracts and never use direct implementation details.

## Restrictions
**Note**: DO NOT DO THE FOLLOWING
- Access environment variable files (e.g. **.env...**). Instead use `.env.example` to lookup environment variable names.
- Access file paths mentioned in the .gitignore file.
