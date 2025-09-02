// File: src/pages/platform-connection/components/PlatformCard.jsx
import React from "react";
import Icon from "../../../components/AppIcon";

const profileUrlFor = (id, name, handle) => {
  if (!handle) return null;
  // Prefer the stable platform id when available; fall back to name.
  switch (id) {
    case "leetcode":   return `https://leetcode.com/${handle}/`;
    case "codeforces": return `https://codeforces.com/profile/${handle}`;
    case "hackerrank": return `https://www.hackerrank.com/profile/${handle}`;
    case "gfg":        return `https://auth.geeksforgeeks.org/user/${handle}/`;
    case "code360":    return `https://www.naukri.com/code360/profile/${handle}`;
    case "codechef":   return `https://www.codechef.com/users/${handle}`;
    default: {
      // Fallback by display name (handles your current names)
      if (name === "LeetCode") return `https://leetcode.com/${handle}/`;
      if (name === "Codeforces") return `https://codeforces.com/profile/${handle}`;
      if (name === "HackerRank") return `https://www.hackerrank.com/profile/${handle}`;
      if (name === "GeeksforGeeks") return `https://auth.geeksforgeeks.org/user/${handle}/`;
      if (name === "Code 360 by Coding Ninjas") return `https://www.naukri.com/code360/profile/${handle}`;
      if (name === "CodeChef") return `https://www.codechef.com/users/${handle}`;
      return null;
    }
  }
};

const PLATFORM_IMAGES = {
  LeetCode: "/assets/images/leetcode.png",
  Codeforces: "/assets/images/codeforces.png",
  HackerRank: "/assets/images/hackerrank.webp",
  GeeksforGeeks: "/assets/images/gfg.png",
  "Code 360 by Coding Ninjas": "/assets/images/codingninjas.jpeg",
  CodeChef: "/assets/images/codechef.png",
};

const PlatformCard = ({ id, platform, onConnect, onDisconnect }) => {
  const { name, description, isConnected, username } = platform;
  const imgSrc = PLATFORM_IMAGES[name] || "/assets/images/default-platform.png";
  const externalUrl = profileUrlFor(id, name, username);

  return (
    <div
      id={id}
      className="card p-6 transition-all duration-200 hover:shadow-md
                 focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50"
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-md flex items-center justify-center mr-3">
            <img
              src={imgSrc}
              alt={`${name} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => { e.currentTarget.src = "/assets/images/default-platform.png"; }}
            />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{name ?? "Platform"}</h3>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center text-success">
              <Icon name="CheckCircle" size={18} className="mr-1" />
              <span className="text-sm font-medium">Connected</span>
            </span>
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary"
                title={`Open ${name} profile`}
                aria-label={`Open ${name} profile in a new tab`}
              >
                <Icon name="ExternalLink" size={18} />
              </a>
            )}
          </div>
        )}
      </div>

      <p className="text-text-secondary text-sm mb-6">{description}</p>

      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-background p-3 rounded-md">
            <div className="flex items-center">
              <Icon name="User" size={16} className="text-text-tertiary mr-2" />
              <span className="text-sm font-medium text-text-primary">{username}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDisconnect}
            className="w-full btn btn-outline py-2 px-4 text-sm"
            aria-label={`Disconnect ${name} account`}
          >
            <Icon name="Unlink" size={16} className="mr-2" />
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="w-full btn btn-primary py-2 px-4 text-sm"
          aria-label={`Connect ${name} account`}
        >
          <Icon name="Link" size={16} className="mr-2" />
          Connect Account
        </button>
      )}
    </div>
  );
};

export default PlatformCard;
