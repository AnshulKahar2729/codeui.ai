import { CapsuleSchema } from "@/lib/schema";
import { ExecutionResultWeb } from "@/lib/types";
import CodeInterpreter, { Sandbox } from "@e2b/code-interpreter";

// Set timeout for sandbox/interpreter (10 minutes)
const sandboxTimeout = 10 * 60 * 1000;

/**
 * API route handler for code execution
 */
export async function POST(req: Request) {
  const {
    capsule,
    userID,
    apiKey,
  }: { capsule: CapsuleSchema; userID: string; apiKey?: string } =
    await req.json();

  try {
    // For multi-language code interpreter
    if (capsule.template === "code-interpreter-multilang") {
      // Create code interpreter instance
      const interpreter = await CodeInterpreter.create({
        metadata: { template: capsule.template, userID },
        timeoutMs: sandboxTimeout,
        apiKey,
      });

      // Install dependencies if needed
      if (
        capsule.additional_dependencies &&
        capsule.install_dependencies_command
      ) {
        // Using commands.run instead of notebook.execCell
        await interpreter.commands.run(capsule.install_dependencies_command);
      }

      // Write code files
      if (capsule.code && Array.isArray(capsule.code)) {
        for (const file of capsule.code) {
          await interpreter.files.write(file.file_path, file.file_content);
        }
      } else if (capsule.file_path && capsule.code) {
        await interpreter.files.write(capsule.file_path, capsule.code);
      }

      // Return connection details
      return new Response(
        JSON.stringify({
          sbxId: interpreter.sandboxId,
          template: capsule.template,
          url: `https://${interpreter.getHost(capsule.port || 80)}`,
        } as unknown as ExecutionResultWeb),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // For all other sandbox templates
    else {
      // Create sandbox instance
      const sandbox = await Sandbox.create(capsule.template, {
        metadata: { template: capsule.template, userID },
        timeoutMs: sandboxTimeout,
        apiKey,
      });

      // Install dependencies if needed
      if (
        capsule.additional_dependencies &&
        capsule.install_dependencies_command
      ) {
        await sandbox.commands.run(capsule.install_dependencies_command);
      }

      // Write code files
      if (capsule.code && Array.isArray(capsule.code)) {
        for (const file of capsule.code) {
          await sandbox.files.write(file.file_path, file.file_content);
        }
      } else if (capsule.file_path && capsule.code) {
        await sandbox.files.write(capsule.file_path, capsule.code);
      }

      // Return connection details
      return new Response(
        JSON.stringify({
          sbxId: sandbox.sandboxId,
          template: capsule.template,
          url: `https://${sandbox.getHost(capsule.port || 80)}`,
        } as unknown as ExecutionResultWeb),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error creating execution environment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create execution environment" }),
      {
        status: 500,
      }
    );
  }
}
