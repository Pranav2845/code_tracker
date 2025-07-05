// src/pages/dashboard/components/SolvedQuestions.jsx
import React, { useState } from "react";
import Icon from "../../../components/AppIcon";

const SolvedQuestions = ({ platforms, problemsMap }) => {
  const connected = Array.isArray(platforms)
    ? platforms.filter((p) => p.isConnected)
    : [];
  const [active, setActive] = useState(connected[0]?.id || "");

  const problems =
    problemsMap && active && Array.isArray(problemsMap[active])
      ? problemsMap[active]
      : [];

  return (
    <div className="bg-surface border rounded p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Solved Questions</h2>
        {connected.length > 0 && (
          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="border border-border rounded text-sm p-1 bg-background"
          >
            {connected.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {problems.length === 0 ? (
        <p className="text-text-secondary">No solved questions</p>
      ) : (
        <ul className="divide-y divide-border">
          {problems.map((q) => (
            <li key={q.id} className="py-2 flex justify-between items-center">
              <span className="text-sm">{q.title}</span>
              {q.url && (
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm flex items-center"
                >
                  View
                  <Icon name="ExternalLink" size={14} className="ml-1" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SolvedQuestions;