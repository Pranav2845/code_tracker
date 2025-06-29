// File: src/pages/topic-analysis/components/ProblemTable.jsx
import React, { useState, useMemo } from "react";
import Icon from "../../../components/AppIcon";

const ProblemTable = ({ problems }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort problems based on current sort configuration
  const sortedProblems = React.useMemo(() => {
    let sortableProblems = [...problems];
    if (sortConfig.key) {
      sortableProblems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProblems;
  }, [problems, sortConfig]);
  
  // Filter problems based on search term
  const filteredProblems = React.useMemo(() => {
    if (!searchTerm) return sortedProblems;
    
    return sortedProblems.filter(problem =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedProblems, searchTerm]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <Icon name="ArrowUpDown" size={14} className="ml-1 text-text-tertiary" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="ml-1 text-primary" />
      : <Icon name="ArrowDown" size={14} className="ml-1 text-primary" />;
  };
  
  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Solved':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'Attempted':
        return { icon: 'Clock', color: 'text-warning' };
      case 'Failed':
        return { icon: 'XCircle', color: 'text-error' };
      default:
        return { icon: 'Circle', color: 'text-text-tertiary' };
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-success';
      case 'Medium':
        return 'text-warning';
      case 'Hard':
        return 'text-error';
      default:
        return 'text-text-tertiary';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium text-text-primary mb-4 sm:mb-0">Recent Problems</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="Search" size={16} className="text-text-tertiary" />
            </div>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">
                  Problem Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('platform')}
              >
                <div className="flex items-center">
                  Platform
                  {getSortIcon('platform')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('difficulty')}
              >
                <div className="flex items-center">
                  Difficulty
                  {getSortIcon('difficulty')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {getSortIcon('date')}
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => {
                const statusInfo = getStatusInfo(problem.status);
                const difficultyColor = getDifficultyColor(problem.difficulty);
                
                return (
                  <tr key={problem.id} className="hover:bg-background transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{problem.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">
                        {problem.platform === 'LeetCode' ? (
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-leetcode mr-2"></span>
                            LeetCode
                          </span>
                        ) : problem.platform === 'CodeForces' ? (
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-codeforces mr-2"></span>
                            CodeForces
                          </span>
                        ) : (
                          problem.platform
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${difficultyColor}`}>{problem.difficulty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${statusInfo.color}`}>
                        <Icon name={statusInfo.icon} size={16} className="mr-1" />
                        {problem.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(problem.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={problem.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark"
                         aria-label={`View ${problem.title} on ${problem.platform}`}
                      >
                        <Icon name="ExternalLink" size={16} />
                      </a>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-text-secondary">
                  <div className="flex flex-col items-center justify-center">
                    <Icon name="Search" size={24} className="text-text-tertiary mb-2" />
                    <p>No problems found matching your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination or load more could be added here */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <div className="text-sm text-text-secondary">
          Showing <span className="font-medium">{filteredProblems.length}</span> of <span className="font-medium">{problems.length}</span> problems
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="px-3 py-1 border border-border rounded text-sm text-text-secondary hover:bg-background disabled:opacity-50"
            disabled
          >
            Previous
          </button>
          <span className="px-3 py-1 bg-primary-50 text-primary rounded text-sm font-medium">1</span>
          <button 
            className="px-3 py-1 border border-border rounded text-sm text-text-secondary hover:bg-background disabled:opacity-50"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemTable;