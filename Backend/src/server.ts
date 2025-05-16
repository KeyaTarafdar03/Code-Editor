import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { runCode } from "./runCommand";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/run", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  try {
    const output = await runCode({ code, language });
    res.json({ output });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Execution failed" });
  }
});

app.post("/api/terminal", async (req, res) => {
  const { command } = req.body;

  if (!command || typeof command !== "string") {
    return res.status(400).json({ output: "Invalid command" });
  }

  try {
    const { stdout, stderr } = await execPromise(command);
    res.json({ output: stderr || stdout || "No output" });
  } catch (err: any) {
    res.json({ output: err.message || "Command failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
