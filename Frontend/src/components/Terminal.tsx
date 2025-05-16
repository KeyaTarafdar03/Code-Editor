import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalProps {
  output: string;
}

const Terminal: React.FC<TerminalProps> = ({ output }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>("");

  useEffect(() => {
    if (terminalRef.current && !termRef.current) {
      const term = new XTerm({
        cursorBlink: true,
        theme: {
          background: "#1e1e1e",
          foreground: "#ffffff",
        },
      });

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      fitAddon.fit();

      term.write("$ ");

      term.onData(async (data) => {
        const code = data.charCodeAt(0);

        if (code === 13) {
          term.write("\r\n");
          const command = inputBuffer.current.trim();
          inputBuffer.current = "";

          if (command.length > 0) {
            const output = await executeCommand(command);
            term.write(output + "\r\n");
          }

          term.write("$ ");
        } else if (data === "\x03") {
          term.write("^C\r\n");
          inputBuffer.current = "";
          await fetch("http://localhost:5000/api/terminate", {
            method: "POST",
          });
          term.write("$ ");
          return;
        } else if (code === 127) {
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.write("\b \b");
          }
        } else {
          inputBuffer.current += data;
          term.write(data);
        }
      });

      termRef.current = term;

      window.addEventListener("resize", () => {
        fitAddon.fit();
      });
    }
  }, []);

  const executeCommand = async (command: string): Promise<string> => {
    try {
      const res = await fetch("http://localhost:5000/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      console.log("data", data);
      return data.output || "No output";
    } catch {
      return "Error executing command.";
    }
  };

  useEffect(() => {
    if (termRef.current) {
      termRef.current.clear();
      termRef.current.writeln(output);
      termRef.current.write("$ ");
    }
  }, [output]);

  return (
    <div
      ref={terminalRef}
      style={{
        height: "300px",
        backgroundColor: "black",
        margin: "0 auto",
        borderRadius: "4px",
        boxShadow: "0 0 10px #00ff00",
      }}
    />
  );
};

export default Terminal;
