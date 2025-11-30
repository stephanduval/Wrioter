# Project Information
LLM_Guide.md can help give you context if you need to understand the application structure, database and documentation.

**Latest documentation location:**
/home/rogers/Code/Wrioter Branch 3/docs/

**Legacy documentation (less recent):**
/home/rogers/Code/Wrioter/docs/LLM_GUIDE.md


# Remote Dev Server Sync Rules
⚠️ **CRITICAL**: Changes made locally must be synced to see them on the dev server!

## Sync Process
- **User runs sync manually** - Changes won't appear until `./sync-to-devserver.sh` is executed
- Dev server runs at: `ssh sduval@10.0.0.2`
- Local path: `/home/rogers/Code/Wrioter Branch 3/`
- Remote path: `/home/sduval/Code/Wrioter Branch 3/`
- Documentation in this folder syncs to remote server

## If code isn't updating after changes:
1. User likely hasn't run `./sync-to-devserver.sh` yet
2. Wait for sync to complete before testing
3. Refresh browser after sync completes

## Important Sync Rules
- **NEVER use manual rsync commands** - Always use `./sync-to-devserver.sh`
- Script ensures `.env*` files are NOT synced (each environment has its own config)
- This prevents breaking the multi-branch setup by reverting URLs from `10.0.0.2` to `localhost`


# Code Standards

## TypeScript-Only Project
⚠️ **CRITICAL**: This is a TypeScript project - all source files MUST be `.ts` or `.vue`

- **NEVER create `.js` files** in the source code
- All new files in `resources/ts/` must be TypeScript
- Vue components use `<script setup lang="ts">`
- Only exception: root config files (e.g., `vite.config.ts`, `cypress.config.cjs`)


# Claude Efficiency Guidelines

## Tool Usage
- Use Task tool for searches spanning multiple files/concepts instead of multiple greps
- Use MultiEdit for multiple changes to same file instead of separate Edit calls
- Use Glob first to find files, then targeted Read
- Batch operations in single messages when possible

## Response Style
- Be concise - aim for 1-4 lines unless complexity requires more
- Skip unnecessary explanations unless requested
- Use fewer tool calls overall
- No preamble like "Here's what I found..." or "Let me check..."

## Search Strategy
- Use specific patterns in single Grep calls
- Use output_mode="files_with_matches" first, then content only if needed
- Combine related searches in single tool calls

## File References
- Use markdown links: [file.ts:42](src/file.ts#L42)
- Avoid backticks for file names

## Deployment
- NEVER use rsync directly
- ALWAYS use ./sync-to-devserver.sh for syncing to remote server
- This ensures .env* files are never overwritten