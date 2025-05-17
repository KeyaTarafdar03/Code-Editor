import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

function App() {
  const [code, setCode] = useState(
    `# Write your Python code here\nprint("Hello, World!")`
  );
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");

  const handleRun = async () => {
    try {
      const res = await axios.post('http://localhost:5000/run', {
        code,
        language,
      });

      setOutput(res.data.output || res.data.error);
    } catch (err) {
      setOutput("Error connecting to backend.");
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif",width:"100vw" }}>
      <h2>Online Code Executor</h2>
      <div>
        <select onChange={(e) => setLanguage(e.target.value)} value={language}>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
        <button onClick={handleRun} style={{ marginLeft: "1rem" }}>
          Run Code
        </button>
      </div>

      <div style={{ height: "400px", marginTop: "1rem" }}>
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val)}
        />
      </div>

      <h3>Output:</h3>
      <pre style={{ background: "#222", color: "#0f0", padding: "1rem" }}>
        {output}
      </pre>
    </div>
  );
}

export default App;
