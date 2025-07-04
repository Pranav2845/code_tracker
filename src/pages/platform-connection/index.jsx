// src/pages/platform-connection/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header";
import PlatformCard from "./components/PlatformCard";
import ConnectionModal from "./components/ConnectionModal";
import ActionButton from "./components/ActionButton";
import { fetchCode360ProfileTotalCount } from "../../api/code360";

export default function PlatformConnection() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 1️⃣ Fetch the user’s current handles
  async function fetchPlatforms() {
    try {
      const { data } = await axios.get("/user/profile");
      const model = [
       { id: "leetcode",     name: "LeetCode",      icon: "Code",    color: "#F0C02D" },
        { id: "codeforces",   name: "Codeforces",    icon: "Terminal", color: "#339AF0" },
        { id: "hackerrank",   name: "HackerRank",    icon: "Code2",   color: "#2EC866" },
        { id: "gfg",          name: "GeeksforGeeks", icon: "Book",    color: "#16A34A" },
          { id: "code360", name: "Code 360 by Coding Ninjas", icon: "Flame",   color: "#44230b" },
        { id: "cses",         name: "CSES",          icon: "Layers",  color: "#0EA5E9" },
        { id: "codechef",     name: "CodeChef",      icon: "PieChart",color: "#8B5CF6" }
      ].map(p => {
        const handle = data.platforms?.[p.id]?.handle || "";
        return {
          ...p,
          description: `Connect your ${p.name} account`,
          isConnected: Boolean(handle),
          username: handle
        };
      });
      setPlatforms(model);
    } catch (err) {
      console.error("❌ fetchPlatforms error:", err);
    }
  }

  useEffect(() => {
    fetchPlatforms();
  }, []);

  // 2️⃣ Open/close the “enter your handle” modal
  const openModal  = (p) => { setCurrentPlatform(p); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  // 3️⃣ Connect (sync) a platform
  async function handleConnect(platformId, { username }) {
    setIsConnecting(true);
    try {
      const { data } = await axios.post(`/platform/sync/${platformId}`, { handle: username });
      if (data.importedCount === 0) {
        // Surface warning from server if no problems were imported
        alert(data.message ||
          "⚠️ No problems imported. Double-check your handle and that your submissions are public.");
      }
      await fetchPlatforms();
            if (platformId === 'code360') {
        try {
          const count = await fetchCode360ProfileTotalCount(username);
          console.log('Code360 total count:', count);
        } catch (err) {
          console.error('❌ fetchCode360ProfileTotalCount error:', err);
        }
      }
      closeModal();
    } catch (err) {
      console.error("❌ sync failed:", err);
      const msg = err.response?.data?.message || "Sync failed—check console for details.";
      alert(msg);
      
    } finally {
      setIsConnecting(false);
    }
  }

  // 4️⃣ Disconnect a platform
  async function handleDisconnect(platformId) {
    try {
      await axios.patch("/user/platforms", { platforms: { [platformId]: "" } });
      await fetchPlatforms();
    } catch (err) {
      console.error("❌ disconnect failed:", err);
      alert("Disconnect failed—check console for details.");
    }
  }

  // 5️⃣ Save & Continue
  function saveAndContinue() {
    if (platforms.some(p => p.isConnected)) {
      navigate("/dashboard");
    } else {
      alert("Please connect at least one platform to continue.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Connect Your Coding Platforms</h1>
        <p className="text-text-secondary mb-8">Link your accounts to track your progress.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {platforms.map(p => (
            <PlatformCard
              key={p.id}
              platform={p}
              onConnect={() => openModal(p)}
              onDisconnect={() => handleDisconnect(p.id)}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <ActionButton onClick={saveAndContinue} label="Save & Continue" icon="ArrowRight" />
        </div>
      </main>

      {isModalOpen && currentPlatform && (
        <ConnectionModal
          platform={currentPlatform}
          onClose={closeModal}
          onConnect={creds => handleConnect(currentPlatform.id, creds)}
          isConnecting={isConnecting}
        />
      )}
    </div>
  );
}
