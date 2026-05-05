<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)


<claude-mem-context>
# Memory Context

# [Workbench] recent context, 2026-05-05 3:22pm PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (10,367t read) | 2,294,550t work | 100% savings

### Apr 28, 2026
S39 Develop Workbench MVP prototype plan and strategy. (Apr 28 at 4:18 PM)
S38 Add Stitch MCP server configuration (Apr 28 at 4:18 PM)
S40 Codex setup status (Apr 28 at 4:31 PM)
S41 Implement word count slider for AI unlock and update gate mechanism. (Apr 28 at 4:43 PM)
### Apr 29, 2026
S42 Fix gate_level migration bug and add preset buttons to Gate Level Picker (Apr 29 at 12:12 AM)
S43 Fix Supabase SQL migration error for gate_level enum type (Apr 29 at 12:20 AM)
### May 5, 2026
824 12:56p 🔴 Fix TypeScript Type Mismatch in Enrollments Action
825 " 🔵 ESLint Errors in Application Code
826 " 🔵 No Unused Locals or Parameters Found
827 " 🔵 Route and Server Action Scan Results
828 " 🔵 Unimported Source Files Scan
829 " 🔵 Code Review Evidence Collected
830 " 🔵 Enrollment Failing Area and Type Mismatch Details
831 " 🔵 ESLint Errors: Prefer Const and Unused Interface
832 " 🔵 Route and Server Action Authentication Status
833 " 🔵 Unimported Source File Identified
834 " 🔵 Bug Pattern Scan Results
840 " 🔵 ESLint Summary and Fixable Issues
841 " 🔵 React Hooks and Navigation Linting Issues
846 " 🔵 React Hooks and Navigation Linting Issues
850 12:57p 🔵 Code Context for Lint and Dead Code Findings
852 " 🔵 Enrollment Type Definition and Data Fetching Context
853 " 🔵 GymChat State Management and Effect Hook Context
854 " 🔵 Form Navigation and Button Context
855 " 🔵 Skeleton Component and Props Context
856 " 🔵 MetricCard Component Definition and Unused Status
857 " 🔵 Unused Variable and State Initialization Context
863 " 🔵 Component and Function Reference Scan
865 " 🔵 MetricCard References Found
866 " 🔵 SkeletonCard References Found
867 " 🔵 listPendingInvitesForMe, respondToInvite, toggleInstructorFlag, and startSession References
875 " 🔵 Gym Start Session Functionality and Related Types
876 " 🔵 MetricCard and NeedsAttentionPanel References
877 " 🔵 TrendChart References
878 " 🔵 Exported Symbols with Low Reference Counts
889 " 🔵 Supabase Client Initialization References
893 " 🔵 Supabase Client Initialization Code Context
896 12:59p 🔵 Code Context for Target Files Before Patch
903 " 🔵 Enrollment Data Mapping and Type Definition
904 " 🔵 GymChat State Synchronization and Event Handling
905 " 🔵 Form Navigation and Cancel Action
906 " 🔵 Skeleton Component Props and Implementation
907 " 🔵 Assignment and Attempt Data Fetching and Processing
908 " 🔵 MetricCard Component Definition and Usage
909 " 🔵 Supabase Client Initialization Details
914 " 🔵 Dashboard Assignment Attempt Logic
915 " 🔵 Assignment Form Initialization and Imports
916 " 🔵 Skeleton Component Definitions
917 " 🔵 MetricCard Component Implementation
1012 2:25p ✅ Realigned Student Dashboard to Prioritize Continuation and Progress
1013 " ✅ Reframed Instructor Dashboard for Class-Level Analytics and Intervention
1014 " ✅ Realigned Thinking Gym Entry and Framing
1015 " ✅ Demoted Support Systems in Navigation and Focus
1016 " ✅ Updated Instructor Analytics Contract
1017 " ✅ Student IA Aligned with Core Functionality
1018 " ✅ Instructor IA Streamlined for Core Tasks

Access 2295k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>