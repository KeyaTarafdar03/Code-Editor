import React from "react";
import Editor from "@monaco-editor/react";

interface Props {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor: React.FC<Props> = ({ code, language, onChange }) => {
  return (
    <Editor
      height="250px"
      defaultLanguage={language}
      language={language}
      defaultValue={code}
      onChange={onChange}
      theme="vs-dark"
    />
  );
};

export default CodeEditor;
