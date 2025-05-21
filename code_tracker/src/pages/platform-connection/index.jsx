import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header";
import PlatformCard from "./components/PlatformCard";
import ConnectionModal from "./components/ConnectionModal";
import ActionButton from "./components/ActionButton";
import Icon from "../../components/AppIcon";

const PlatformConnection = () => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([
    {
      id: "leetcode",
      name: "LeetCode",
      icon: "Code",
      color: "var(--color-leetcode)",
      description: "Connect your LeetCode account to track your problem-solving progress.",
      isConnected: false,
      username: "",
    },
    {
      id: "codeforces",
      name: "Codeforces",
      icon: "Terminal",
      color: "var(--color-codeforces)",
      description: "Link your Codeforces profile to analyze your competitive programming skills.",
      isConnected: false,
      username: "",
    },
    {
      id: "hackerrank",
      name: "HackerRank",
      icon: "Code2",
      color: "var(--color-success)",
      description: "Connect HackerRank to include your challenges and competitions in your analysis.",
      isConnected: false,
      username: "",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleOpenModal = (platform) => {
    setCurrentPlatform(platform);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Return focus to the platform card after modal closes
    const platformCard = document.getElementById(`platform-card-${currentPlatform?.id}`);
    if (platformCard) {
      platformCard.focus();
    }
  };

  const handleConnect = async (platformId, credentials) => {
    setIsConnecting(true);
    
    // Simulate API connection verification with a timeout
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Update the platform connection status
      setPlatforms(platforms.map(platform => {
        if (platform.id === platformId) {
          return {
            ...platform,
            isConnected: true,
            username: credentials.username
          };
        }
        return platform;
      }));
      
      setIsConnecting(false);
      handleCloseModal();
    } catch (error) {
      setIsConnecting(false);
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = (platformId) => {
    setPlatforms(platforms.map(platform => {
      if (platform.id === platformId) {
        return {
          ...platform,
          isConnected: false,
          username: ""
        };
      }
      return platform;
    }));
  };

  const handleSaveAndContinue = () => {
    const hasConnectedPlatform = platforms.some(platform => platform.isConnected);
    
    if (hasConnectedPlatform) {
      navigate("/dashboard");
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Connect Your Coding Platforms</h1>
          <p className="text-text-secondary max-w-3xl">
            Link your accounts from popular coding platforms to track your progress, analyze your performance, 
            and get personalized recommendations to improve your skills.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              id={`platform-card-${platform.id}`}
              platform={platform}
              onConnect={() => handleOpenModal(platform)}
              onDisconnect={() => handleDisconnect(platform.id)}
            />
          ))}
        </div>
        
        <div className="flex justify-end relative">
          <ActionButton 
            onClick={handleSaveAndContinue}
            label="Save & Continue"
            icon="ArrowRight"
          />
          
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 p-3 bg-surface border border-border rounded-lg shadow-lg text-text-primary text-sm animate-fade-in z-10">
              <div className="flex items-start">
                <Icon name="AlertCircle" size={16} className="text-warning mr-2 mt-0.5" />
                <p>Please connect at least one platform to continue</p>
              </div>
              <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-surface border-r border-b border-border"></div>
            </div>
          )}
        </div>
      </main>
      
      {isModalOpen && currentPlatform && (
        <ConnectionModal
          platform={currentPlatform}
          onClose={handleCloseModal}
          onConnect={(credentials) => handleConnect(currentPlatform.id, credentials)}
          isConnecting={isConnecting}
        />
      )}
    </div>
  );
};

export default PlatformConnection;