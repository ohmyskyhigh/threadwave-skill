# ThreadWave Error Support

Own diagnosis, evidence-based runtime repair, public solution search, and sanitized reporting. A completed task missing its requested deliverable/count must be reported under existing reporting authorization even when the CLI reports success or supplies no error code. Preserve the original request and return verified recovery results to its workflow owner.

## Mandatory Contract

Read [error-support-contract.md](error-support-contract.md) completely before handling a failure or report request. Follow its classification, search, validation, redaction, and output rules as one flow.

Read-only diagnosis does not require successful workflow preflight. Do not recursively invoke an operation workflow. Never directly mutate GitHub; authorized report submission goes through the ThreadWave backend. The originating skill owns workflow continuation, generation restarts, and all review or X-mutation decisions.

## Task Boundary

Handle the failure in the current conversation. Create a separate support task only if the user requests one; lack of task-creation tools is not a blocker. Keep exact refs in local working context, and share only the contract's sanitized fields with the specified destination. Contact and JSONL are private backend evidence.

For an explicit report-only request, gather relevant read-only evidence without repairs or workflow retries. “Prepare only” remains unsent; “report/send” authorizes the report submission described in the contract. Otherwise diagnose and apply eligible repairs without asking the user to repeat the request or approve each check.

## Setup Boundary

If installation or an update is needed, return the affected component and evidence to the caller to handle through the entry within existing authorization using:

`https://www.threadwave.xyz/cli/setup/agent.md`

Do not recursively invoke preflight from support or install skills, the CLI, or the extension directly. Missing setup dependencies do not block available read-only diagnosis or report preparation.

## Language

Use the user's explicit language preference, then the latest message, then the conversation language, defaulting to English. Support English and Simplified Chinese. Keep skill names, schemas, error codes, labels, and commands in English.

## Return Format

```text
State: <recovered | needs user action | solution found | workaround found | known open error | report ready | submitted | stored | unsubmitted | unconfirmed | not report-worthy>
Problem: <stable code and localized summary>
Search: <matched | no match | unavailable>
Sources: <zero to three canonical GitHub issue links>
Repair: <what changed and how it was verified, or none>
Next: <return to workflow owner | scoped setup/update | one required user action | maintainer investigation>
Issue report: <receipt state, report ID, confirmed issue URL if any, and retained local file locations>
```

Always say whether search completed and whether a report was generated. Claim submission only for a validated submitted receipt with its confirmed issue URL. Report descriptions contain observations, never suspected causes or compatibility verdicts.
