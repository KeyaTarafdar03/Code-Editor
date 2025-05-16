import React, { useState, useEffect } from "react";
import { CodeEditor, Terminal } from "./components";

const defaultCodes: Record<string, string> = {
  javascript: `console.log('Hello, world!');`,
  python: `print("Hello, world!")`,
  c: `#include <stdio.h>\nint main() {\n    printf("Hello, world!\\n");\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}`,
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(defaultCodes["javascript"]);
  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    setCode(defaultCodes[language] || "");
  }, [language]);

  const runCode = async () => {
    setOutput("Running...");
    try {
      const res = await fetch("http://localhost:5000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      setOutput(data.output || data.error || "No output");
    } catch (err) {
      setOutput("Error executing code");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        color: "white",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      <div
        style={{
          padding: "1rem",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Code Editor
        </h1>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Select Language:{" "}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "0.3rem",
              borderRadius: "4px",
              fontSize: "1rem",
              marginLeft: "0.5rem",
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>
        </label>

        <CodeEditor
          code={code}
          language={language}
          onChange={(value) => setCode(value || "")}
        />

        <button
          onClick={runCode}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#007acc",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Run Code
        </button>

        <h2 style={{ marginTop: "2rem" }}>Output Terminal:</h2>
      </div>
      <Terminal output={output} />
    </div>
  );
};

export default App;
