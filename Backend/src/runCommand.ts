import { exec, ChildProcess } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface RunOptions {
  language: string;
  code: string;
}

let runningProcess: ChildProcess | null = null;

export const runCode = async ({
  language,
  code,
}: RunOptions): Promise<string> => {
  const tempId = uuidv4();
  const tempDir = path.join(__dirname, "..", "temp");
  await fs.mkdir(tempDir, { recursive: true });

  let filePath = "";
  let command = "";

  switch (language) {
    case "javascript":
      filePath = path.join(tempDir, `${tempId}.js`);
      await fs.writeFile(filePath, code);
      command = `node ${filePath}`;
      break;

    case "python":
      filePath = path.join(tempDir, `${tempId}.py`);
      await fs.writeFile(filePath, code);
      command = `python ${filePath}`;
      break;

    case "c":
      filePath = path.join(tempDir, `${tempId}.c`);
      await fs.writeFile(filePath, code);
      command = `gcc ${filePath} -o ${tempDir}/${tempId} && ${tempDir}/${tempId}`;
      break;

    case "java":
      filePath = path.join(tempDir, `Main.java`);
      await fs.writeFile(filePath, code);
      command = `javac ${filePath} && java -cp ${tempDir} Main`;
      break;

    default:
      throw new Error("Unsupported language");
  }

  return new Promise((resolve) => {
    runningProcess = exec(
      command,
      {
        shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash",
        timeout: 5000,
      },
      async (error, stdout, stderr) => {
        runningProcess = null;

        try {
          await fs.unlink(filePath);
          if (language === "c") {
            await fs.unlink(path.join(tempDir, tempId));
          }
          if (language === "java") {
            await fs.unlink(path.join(tempDir, `Main.class`));
          }
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }

        if (error) {
          if ((error as any).killed) {
            resolve("Execution timed out or terminated.");
          } else {
            resolve(stderr || error.message);
          }
        } else if (stderr) {
          resolve(stderr);
        } else {
          resolve(stdout || "No output");
        }
      }
    );
  });
};

export const terminateRunningProcess = () => {
  if (runningProcess) {
    runningProcess.kill("SIGINT");
    runningProcess = null;
  }
};
