# Project Information
LLM_Guide.md can help give you context if you need to understand the application structure, database and documentation.

**Latest documentation location:**
/home/rogers/Code/Wrioter Branch 3/docs/

**Legacy documentation (less recent):**
/home/rogers/Code/Wrioter/docs/LLM_GUIDE.md


# Remote Dev Server Sync Rules
⚠️ **NOTE**: A background sync script runs automatically - no need to manually sync.

## Sync Process
- **Sync runs automatically in background** - Changes sync continuously
- Dev server runs at: `ssh sduval@10.0.0.2`
- Local path: `/home/sduval/Code/Wrioter Branch 2/`
- Remote path: `/home/sduval/Code/Wrioter Branch 2/`

## Important Sync Rules
- **NEVER use manual rsync commands** - Background sync handles it
- Script ensures `.env*` files are NOT synced (each environment has its own config)
- LLM does NOT need to sync after changes - it happens automatically


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