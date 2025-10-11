# Project Information
LLM_Guide.md can help give you context if you need to understand the application structure, database and documentation:
/home/rogers/Code/Wrioter/docs/LLM_GUIDE.md


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