const express = require("express");
const cors = require("cors");
const Docker = require("dockerode");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const docker = new Docker();

app.use(cors());
app.use(express.json());

app.post("/run", async (req, res) => {
  let { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Missing code or language" });
  }

  language = language.trim().toLowerCase(); // normalize

  const id = uuidv4();
  const extMap = {
    python: "py",
    cpp: "cpp",
    c: "c",
    rust: "rs",
    javascript: "js"
  };
  const ext = extMap[language];

  if (!ext) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const filename = `${id}.${ext}`;
  const tempDir = path.join(__dirname, "temp", id);
  const localPath = path.join(tempDir, filename);
  const containerPath = `/home/runner/${filename}`;
  const executablePath = `/home/runner/${id}`;

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(localPath, code);

    let execCmd;
    switch (language) {
      case "python":
        execCmd = `python3 ${containerPath}`;
        break;
      case "c":
        execCmd = `bash -c "gcc ${containerPath} -o ${executablePath} && ${executablePath}"`;
        break;
      case "cpp":
        execCmd = `bash -c "g++ ${containerPath} -o ${executablePath} && ${executablePath}"`;
        break;
      case "rust":
        execCmd = `bash -c "rustc ${containerPath} -o ${executablePath} && ${executablePath}"`;
        break;
      case "javascript":
        execCmd = `node ${containerPath}`;
        break;
    }

    const container = await docker.createContainer({
      Image: "code-executor",
      Cmd: ["sh", "-c", execCmd],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      HostConfig: {
        Binds: [`${tempDir}:/home/runner`],
        NetworkMode: "none",
        Memory: 512 * 1024 * 1024,
        CpuShares: 512
      }
    });

    await container.start();
    await container.wait();

    const logs = await container.logs({
      stdout: true,
      stderr: true
    });

    let output = logs.toString("utf-8").replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

    await container.remove();
    fs.rmSync(tempDir, { recursive: true, force: true });

    res.json({ output });
  } catch (err) {
    console.error("Execution error:", err);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    res.status(500).json({ error: "Execution failed", detail: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
