import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "./SolveContestProblem.css"; // Or rename to SolveProblem.css

const SolveProblem = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("statement");
  const [mySubmissions, setMySubmissions] = useState([]);

  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50);

  const languageMap = {
    cpp: 54,
    python: 71,
    java: 62,
  };

  const boilerplate = {
    cpp: `#include<iostream>
using namespace std;
int main() {
    // your code here
    return 0;
}`,
    python: `# your code here`,
    java: `public class Main {
    public static void main(String[] args) {
        // your code here
    }
}`,
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/problems/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblem(res.data);
        setCode(boilerplate[language]);
        setCustomInput(res.data.sampleTestCases?.[0]?.input || "");
      } catch (err) {
        console.error("Error fetching problem", err);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/submissions/user/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMySubmissions(res.data);
      } catch (err) {
        console.error("Failed to load submissions", err);
      }
    };

    fetchProblem();
    fetchSubmissions();
  }, [problemId, language]);

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running...");
    setVerdict("");

    try {
      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: customInput,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      const expected = problem.sampleTestCases[0].output.trim();
      setVerdict(finalOutput.trim() === expected ? "✅ Correct Output" : "❌ Wrong Output");
    } catch (err) {
      console.error("Run Error", err);
      setOutput("Error running code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setOutput("Evaluating hidden test cases...");
    setVerdict("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:2358/submissions?base64_encoded=false&wait=true",
        {
          language_id: languageMap[language],
          source_code: code,
          stdin: problem.hiddenTestCases[0].input,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const { stdout, stderr, compile_output } = res.data;
      const finalOutput = stdout || stderr || compile_output || "No output";
      setOutput(finalOutput.trim());

      const expected = problem.hiddenTestCases[0].output.trim();
      const isSuccess = finalOutput.trim() === expected;
      setVerdict(isSuccess ? "✅ Correct Output" : "❌ Wrong Output");

      await axios.post(
        "http://localhost:5000/api/submissions",
        {
          problemId,
          code,
          language,
          isSuccess,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Submit Error", err);
      setOutput("Submission error");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    const containerWidth = containerRef.current.offsetWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  if (!problem) return <p>Loading problem...</p>;

  return (
    <div className="solve-page" ref={containerRef}>
      <div className="solve-container">
        {/* Left Panel */}
        <div className="solve-left" style={{ width: `${leftWidth}%` }}>
          <div className="left-tabs">
            <button className={activeTab === "statement" ? "active-tab" : ""} onClick={() => setActiveTab("statement")}>
              📝 Problem
            </button>
            <button className={activeTab === "submissions" ? "active-tab" : ""} onClick={() => setActiveTab("submissions")}>
              📊 My Submissions
            </button>
          </div>

          <div className="left-content">
            {activeTab === "statement" ? (
              <>
                <h2>{problem.title}</h2>
                <p>{problem.description}</p>

                <h3>Sample Test Cases:</h3>
                {problem.sampleTestCases?.length > 0 ? (
                  problem.sampleTestCases.map((test, idx) => (
                    <div key={idx}>
                      <strong>Input {idx + 1}:</strong>
                      <pre>{test.input}</pre>
                      <strong>Output {idx + 1}:</strong>
                      <pre>{test.output}</pre>
                    </div>
                  ))
                ) : (
                  <p>No sample test cases available.</p>
                )}
              </>
            ) : (
              <>
                <h2>📋 Submission History</h2>
                {mySubmissions.length === 0 ? (
                  <p>No submissions yet.</p>
                ) : (
                  <div className="submission-history">
                    {mySubmissions.map((sub, index) => (
                      <div key={index} className="submission-card">
                        <div className="submission-header">
                          <span className={`verdict ${sub.isSuccess ? "passed" : "failed"}`}>
                            {sub.isSuccess ? "✅ Passed" : "❌ Failed"}
                          </span>
                          <span className="lang-label">Lang: {sub.language}</span>
                          <span className="timestamp">{new Date(sub.submittedAt).toLocaleString()}</span>
                        </div>
                        <pre className="submission-code">
                          {sub.code.length > 500 ? sub.code.slice(0, 500) + "\n... (truncated)" : sub.code}
                        </pre>
                        <button
                          className="rerun-btn"
                          onClick={() => {
                            setCode(sub.code);
                            setLanguage(sub.language);
                            setOutput("// Loaded code from previous submission");
                            setVerdict("");
                          }}
                        >
                          🔁 Re-run This Code
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Resizer */}
        <div
          className="resizer"
          onMouseDown={() => {
            document.addEventListener("mousemove", handleDrag);
            document.addEventListener("mouseup", () => {
              document.removeEventListener("mousemove", handleDrag);
            });
          }}
        ></div>

        {/* Right Panel */}
        <div className="solve-right" style={{ width: `${100 - leftWidth}%` }}>
          <div className="editor-toolbar">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="cpp">🖥️ C++</option>
              <option value="python">🐍 Python</option>
              <option value="java">☕ Java</option>
            </select>
            <button onClick={handleRun} disabled={loading}>Run</button>
            <button onClick={handleSubmit} disabled={loading}>Submit</button>
          </div>

          <Editor
            height="60vh"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(val) => setCode(val)}
          />

          <div className="input-box">
            <h3>Custom Input:</h3>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom input here"
            />
          </div>

          <div className="output-box">
            <h4>Output:</h4>
            <pre>{output}</pre>
            {verdict && <p className="verdict">Verdict: {verdict}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveProblem;
