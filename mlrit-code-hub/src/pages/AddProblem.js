import React, { useState } from "react";
import axios from "axios";
import "./AddProblem.css";

const AddProblem = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    score: 50,
    sampleTestCases: [{ input: "", output: "" }],
    hiddenTestCases: [{ input: "", output: "" }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (type, index, field, value) => {
    const updated = [...formData[type]];
    updated[index][field] = value;
    setFormData({ ...formData, [type]: updated });
  };

  const addTestCase = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], { input: "", output: "" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/problems/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Problem added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding problem.");
    }
  };

  return (
    <div className="add-problem">
      <h2>Add Problem</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Problem Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Problem Description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          required
        />
        <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input
          name="score"
          type="number"
          placeholder="Score"
          value={formData.score}
          onChange={handleChange}
          required
        />

        <h4>📘 Sample Test Cases</h4>
        {formData.sampleTestCases.map((tc, idx) => (
          <div key={idx} className="test-case">
            <input
              placeholder="Input"
              value={tc.input}
              onChange={(e) =>
                handleTestCaseChange("sampleTestCases", idx, "input", e.target.value)
              }
            />
            <input
              placeholder="Expected Output"
              value={tc.output}
              onChange={(e) =>
                handleTestCaseChange("sampleTestCases", idx, "output", e.target.value)
              }
            />
          </div>
        ))}
        <button type="button" onClick={() => addTestCase("sampleTestCases")}>
          + Add Sample Case
        </button>

        <h4>🔒 Hidden Test Cases</h4>
        {formData.hiddenTestCases.map((tc, idx) => (
          <div key={idx} className="test-case">
            <input
              placeholder="Input"
              value={tc.input}
              onChange={(e) =>
                handleTestCaseChange("hiddenTestCases", idx, "input", e.target.value)
              }
            />
            <input
              placeholder="Expected Output"
              value={tc.output}
              onChange={(e) =>
                handleTestCaseChange("hiddenTestCases", idx, "output", e.target.value)
              }
            />
          </div>
        ))}
        <button type="button" onClick={() => addTestCase("hiddenTestCases")}>
          + Add Hidden Case
        </button>

        <br />
        <button type="submit">Submit Problem</button>
      </form>
    </div>
  );
};

export default AddProblem;
