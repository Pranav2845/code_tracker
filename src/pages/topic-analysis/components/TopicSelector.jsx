// File: src/pages/topic-analysis/components/TopicSelector.jsx
import React from "react";
import Icon from "../../../components/AppIcon";

const TopicSelector = ({ topics, selectedTopic, onTopicChange, isLoading }) => {
  return (
    <div className="bg-surface rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="topic-select" className="block text-sm font-medium text-text-primary mb-2 sm:mb-0">
          Select a topic to analyze
        </label>
        <div className="relative w-full sm:w-64">
          <select
            id="topic-select"
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={isLoading}
            className="block w-full pl-3 pr-10 py-2 text-base border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Select a topic"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.name}>
                {topic.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <Icon name="ChevronDown" size={16} className="text-text-tertiary" />
          </div>
        </div>
      </div>
      
      {/* Topic description based on selection */}
      <div className="mt-4 text-sm text-text-secondary">
        {selectedTopic === "Arrays" && (
          <p>Arrays are a fundamental data structure that store elements of the same type in contiguous memory locations.</p>
        )}
        {selectedTopic === "Strings" && (
          <p>String problems involve manipulation and processing of character sequences and often test pattern matching skills.</p>
        )}
        {selectedTopic === "Linked Lists" && (
          <p>Linked Lists are linear data structures where elements are stored in nodes that point to the next node in the sequence.</p>
        )}
        {selectedTopic === "Trees" && (
          <p>Tree problems involve hierarchical data structures with a root value and subtrees of children with a parent node.</p>
        )}
        {selectedTopic === "Graphs" && (
          <p>Graph problems involve non-linear data structures consisting of nodes and edges, often testing traversal algorithms.</p>
        )}
        {selectedTopic === "Dynamic Programming" && (
          <p>Dynamic Programming involves breaking down complex problems into simpler overlapping subproblems and solving each only once.</p>
        )}
        {selectedTopic === "Sorting & Searching" && (
          <p>Sorting and searching problems test your ability to efficiently organize and find elements in collections.</p>
        )}
        {selectedTopic === "Greedy Algorithms" && (
          <p>Greedy algorithms make locally optimal choices at each stage with the hope of finding a global optimum.</p>
        )}
      </div>
    </div>
  );
};

export default TopicSelector;