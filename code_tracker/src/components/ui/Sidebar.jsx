import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

function Sidebar({ variant = 'expanded' }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(variant === 'collapsed');
  
  const navigation = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: 'LayoutDashboard' 
    },
    { 
      name: 'Platform Connection', 
      path: '/platform-connection', 
      icon: 'Link',
      platforms: [
        { name: 'LeetCode', path: '/platform-connection/leetcode', icon: 'Code' },
        { name: 'CodeForces', path: '/platform-connection/codeforces', icon: 'Code' },
        { name: 'HackerRank', path: '/platform-connection/hackerrank', icon: 'Code' }
      ]
    },
    { 
      name: 'Topic Analysis', 
      path: '/topic-analysis', 
      icon: 'BarChart2',
      topics: [
        { name: 'Arrays', path: '/topic-analysis/arrays', icon: 'List' },
        { name: 'Strings', path: '/topic-analysis/strings', icon: 'Type' },
        { name: 'Dynamic Programming', path: '/topic-analysis/dp', icon: 'GitBranch' },
        { name: 'Graphs', path: '/topic-analysis/graphs', icon: 'Network' }
      ]
    },
    { 
      name: 'Onboarding', 
      path: '/onboarding', 
      icon: 'Compass' 
    }
  ];
  
  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState({});
  
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const isSubActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Determine sidebar width based on variant and collapsed state
  const sidebarWidthClass = isCollapsed ? 'w-16' : 'w-64';
  const isMobile = variant === 'mobile';
  
  return (
    <aside 
      className={`${sidebarWidthClass} ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : 'relative'} h-screen bg-surface border-r border-border flex flex-col transition-all duration-300`}
      aria-label="Sidebar"
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white mr-2">
              <Icon name="Code" size={18} />
            </div>
            <span className="font-display font-semibold text-lg text-text-primary">
              CodeTracker
            </span>
          </Link>
        )}
        
        {isCollapsed && (
          <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-md bg-primary text-white">
            <Icon name="Code" size={18} />
          </div>
        )}
        
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
            aria-label="Collapse sidebar"
          >
            <Icon name="PanelLeftClose" size={18} />
          </button>
        )}
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const hasSubItems = item.platforms || item.topics;
            const isExpanded = expandedSections[item.name];
            const isItemActive = isActive(item.path);
            const isItemSubActive = isSubActive(item.path);
            
            return (
              <li key={item.name}>
                {hasSubItems ? (
                  <div>
                    <button
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isItemSubActive
                          ? 'bg-primary-50 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-background'
                      }`}
                      onClick={() => toggleSection(item.name)}
                      aria-expanded={isExpanded}
                      aria-controls={`${item.name}-submenu`}
                    >
                      <div className="flex items-center">
                        <Icon 
                          name={item.icon} 
                          size={18} 
                          className={`${isCollapsed ? 'mx-auto' : 'mr-2'}`} 
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isCollapsed && (
                        <Icon 
                          name={isExpanded ? 'ChevronDown' : 'ChevronRight'} 
                          size={16} 
                        />
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {!isCollapsed && isExpanded && (
                      <ul 
                        id={`${item.name}-submenu`}
                        className="mt-1 pl-6 space-y-1"
                      >
                        {item.platforms && item.platforms.map((platform) => (
                          <li key={platform.name}>
                            <Link
                              to={platform.path}
                              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive(platform.path)
                                  ? 'bg-primary-50 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-background'
                              }`}
                              aria-current={isActive(platform.path) ? 'page' : undefined}
                            >
                              <Icon name={platform.icon} size={16} className="mr-2" />
                              <span>{platform.name}</span>
                            </Link>
                          </li>
                        ))}
                        
                        {item.topics && item.topics.map((topic) => (
                          <li key={topic.name}>
                            <Link
                              to={topic.path}
                              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive(topic.path)
                                  ? 'bg-primary-50 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-background'
                              }`}
                              aria-current={isActive(topic.path) ? 'page' : undefined}
                            >
                              <Icon name={topic.icon} size={16} className="mr-2" />
                              <span>{topic.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isItemActive
                        ? 'bg-primary-50 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-background'
                    }`}
                    aria-current={isItemActive ? 'page' : undefined}
                  >
                    <Icon 
                      name={item.icon} 
                      size={18} 
                      className={`${isCollapsed ? 'mx-auto' : 'mr-2'}`} 
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        {isCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="p-2 w-full flex justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
            aria-label="Expand sidebar"
          >
            <Icon name="PanelLeftOpen" size={18} />
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium">
                JD
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-text-primary">John Doe</p>
                <p className="text-xs text-text-tertiary">john@example.com</p>
              </div>
            </div>
            <button
              className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-label="User settings"
            >
              <Icon name="Settings" size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;