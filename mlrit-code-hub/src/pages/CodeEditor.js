import React, { useState, useEffect } from "react";
import axios from "axios";
import { Editor } from "@monaco-editor/react"; 
import "./CodeEditor.css";

// ✅ Move boilerplate and languageMap outside the component
const languageMap = {
  cpp: 54,
  python: 71,
  java: 62,
};

const boilerplate = {
  cpp: `#include<iostream>
using namespace std;
int main() {
    return 0;
}`,
  python: `# cook your dish here`,
  java: `public class Main {
    public static void main(String[] args) {
    }
}`,
};

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(null);
  const [memory, setMemory] = useState(null);
  const [theme, setTheme] = useState("vs-dark");

  useEffect(() => {
    const savedCode = localStorage.getItem(`code-${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(boilerplate[language]);
    }
  }, [language]);

  useEffect(() => {
    if (code) {
      localStorage.setItem(`code-${language}`, code);
    }
  }, [code, language]);

  const handleRunCode = async () => {
    setLoading(true);
    const payload = {
      language_id: languageMap[language],
      source_code: code,
      stdin: input,
    };

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      const { stdout, stderr, compile_output, time, memory } = res.data;
      if (stderr) {
        setOutput(`❗ Runtime Error:\n\n${stderr}`);
      } else if (compile_output) {
        setOutput(`❗ Compilation Error:\n\n${compile_output}`);
      } else {
        setOutput(stdout || "No output.");
      }
      setTime(time);
      setMemory(memory);
    } catch (err) {
      console.error(err);
      setOutput("❌ Server Error. Please check Judge0 is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    const saved = localStorage.getItem(`code-${selectedLang}`);
    if (saved) {
      setCode(saved);
    } else {
      setCode(boilerplate[selectedLang]);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
  };

  return (
    <div className="online-compiler">
      <div className="compiler-header">
        <h2>Online Compiler</h2>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "vs-dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="compiler-body">
        <div className="left-panel">
          <div className="top-bar">
            <select value={language} onChange={handleLanguageChange}>
              <option value="cpp">🖥️ C++</option>
              <option value="python">🐍 Python</option>
              <option value="java">☕ Java</option>
            </select>
            <button onClick={handleRunCode}>Run</button>
          </div>

          <Editor
            height="70vh"
            theme={theme}
            language={language}
            value={code}
            onChange={(newCode) => setCode(newCode)}
          />
        </div>

        <div className="right-panel">
          <div className="input-area">
            <h4>Enter Input</h4>
            <textarea
              className="input-box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <p className="input-note">
              If your code requires input, add it above before running.
            </p>
          </div>

          <div className="output-area">
            <h4>Output</h4>
            <div className="output-box">
              {loading ? (
                <div className="loader">Running...</div>
              ) : (
                <>
                  <pre>{output}</pre>
                  {time && memory && (
                    <div className="stats">
                      <p>Execution Time: {time} s</p>
                      <p>Memory Used: {memory} KB</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
