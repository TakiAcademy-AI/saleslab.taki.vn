import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Runs the Codex CLI as a plain text generator.
 *
 * Codex is a coding agent, not an inference API: it can execute shell commands
 * the model writes. The prompt here embeds sales-rep input, which is untrusted,
 * so every invocation is pinned to `--sandbox read-only`, given a throwaway
 * working directory, and denied network escalation. The CLI still needs a
 * writable CODEX_HOME for its session cache, so point that at a volume holding
 * nothing but the auth token — never the host's ~/.codex.
 */
export type CodexResult = { ok: true; data: unknown } | { ok: false; error: string };

const DEFAULT_TIMEOUT_MS = 60_000;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("codex produced no output");

  // The agent prints progress before its final answer; take the last balanced
  // object rather than assuming the whole stream is JSON.
  const start = trimmed.lastIndexOf("{");
  for (let index = start; index >= 0; index -= 1) {
    if (trimmed[index] !== "{") continue;
    const candidate = trimmed.slice(index);
    try {
      return JSON.parse(candidate);
    } catch {
      const end = candidate.lastIndexOf("}");
      if (end > 0) {
        try {
          return JSON.parse(candidate.slice(0, end + 1));
        } catch {
          // keep scanning left
        }
      }
    }
  }
  throw new Error("codex output contained no parsable JSON");
}

export async function runCodex(options: {
  prompt: string;
  schema: object;
  timeoutMs?: number;
}): Promise<CodexResult> {
  const schemaPath = join(tmpdir(), `codex-schema-${process.pid}.json`);
  try {
    writeFileSync(schemaPath, JSON.stringify(options.schema));
  } catch (error) {
    return { ok: false, error: `cannot write schema: ${String(error)}` };
  }

  const binary = process.env.CODEX_BIN ?? "codex";
  const codexHome = process.env.CODEX_HOME ?? "/codex";
  const args = [
    "exec",
    "--skip-git-repo-check",
    "--sandbox",
    "read-only",
    "--cd",
    tmpdir(),
    "--output-schema",
    schemaPath,
    options.prompt,
  ];

  return new Promise<CodexResult>((resolve) => {
    const child = spawn(binary, args, {
      // Deliberately minimal: the child inherits no app secrets.
      env: {
        PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
        HOME: codexHome,
        CODEX_HOME: codexHome,
      } as unknown as NodeJS.ProcessEnv,
      stdio: ["ignore", "pipe", "pipe"] as const,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ ok: false, error: "codex timed out" });
    }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ ok: false, error: `codex failed to start: ${error.message}` });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        resolve({ ok: false, error: `codex exited ${code}: ${stderr.slice(-300)}` });
        return;
      }
      try {
        // Newer builds print the structured answer on stdout; older ones echo it
        // to stderr as well, so fall back before giving up.
        resolve({ ok: true, data: extractJson(stdout || stderr) });
      } catch (error) {
        resolve({ ok: false, error: String(error) });
      }
    });
  });
}
