// src/pages/platform-connection/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header";
import PlatformCard from "./components/PlatformCard";
import ConnectionModal from "./components/ConnectionModal";
import ActionButton from "./components/ActionButton";
import { fetchCode360ProfileTotalCount } from "../../api/code360";

const DEBUG = import.meta.env.DEV;

export default function PlatformConnection() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 1️⃣ Fetch the user’s current handles
  async function fetchPlatforms() {
    try {
      const { data } = await axios.get("/api/user/profile");
      const model = [
        { id: "leetcode",   name: "LeetCode",      icon: "Code",     color: "#F0C02D" },
        { id: "codeforces", name: "Codeforces",    icon: "Terminal", color: "#339AF0" },
        { id: "hackerrank", name: "HackerRank",    icon: "Code2",    color: "#2EC866" },
        { id: "gfg",        name: "GeeksforGeeks", icon: "Book",     color: "#16A34A" },
        { id: "code360",    name: "Code 360 by Coding Ninjas", icon: "Flame", color: "#44230b" },
        { id: "codechef",   name: "CodeChef",      icon: "PieChart", color: "#8B5CF6" }
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
      if (DEBUG) console.error("❌ fetchPlatforms error:", err);
    }
  }

  useEffect(() => {
    fetchPlatforms();
  }, []);

  // 2️⃣ Open/close the “enter your handle” modal
  const openModal  = (p) => { setCurrentPlatform(p); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  // Helper: poll /user/profile until a given platform shows connected (or timeout)
  async function pollUntilConnected({ platformId, timeoutMs = 60000, intervalMs = 4000 }) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const { data } = await axios.get("/api/user/profile");
        const handle = data.platforms?.[platformId]?.handle || "";
        if (handle) {
          // sync completed — refresh full list for counts, etc.
          await fetchPlatforms();
          return true;
        }
      } catch (e) {
        if (DEBUG) console.error("pollUntilConnected: profile fetch failed", e);
      }
      // wait
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  }

  // 3️⃣ Connect (sync) a platform
  async function handleConnect(platformId, { username }) {
    setIsConnecting(true);
    try {
      const { data } = await axios.post(`/api/platform/sync/${platformId}`, { handle: username });

      // only warn on other platforms—Code360 uses the total-count API fallback
      // 🔧 IMPORTANT CHANGE: do NOT warn for LeetCode when importedCount is 0 (sync is often delayed)
      if (platformId !== "code360" && platformId !== "leetcode" && data.importedCount === 0) {
        alert(
          data.message ||
            "⚠️ No problems imported. Double-check your handle and that your submissions are public."
        );
      }

      // Optional post-sync data fetch for Code360
      if (platformId === "code360") {
        try {
          const count = await fetchCode360ProfileTotalCount(username);
          if (DEBUG) console.log("Code360 total count:", count);
        } catch (err) {
          if (DEBUG) console.error("❌ fetchCode360ProfileTotalCount error:", err);
        }
      }

      // Optimistically mark the platform as connected so the UI updates immediately
      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId ? { ...p, isConnected: true, username } : p
        )
      );

      // Close the modal as soon as sync POST succeeds
      closeModal();

      // ➤ For LeetCode, poll until the backend finishes linking (no “failed” toast on lag)
      if (platformId === "leetcode") {
        const ok = await pollUntilConnected({ platformId: "leetcode" });
        if (!ok) {
          // Timed out – show a gentle message, not an error
          if (DEBUG) console.warn("LeetCode sync still pending after polling window.");
          alert("LeetCode is still syncing in the background. You can continue and refresh later.");
        }
      }

      // For other platforms, just refresh once
      if (platformId !== "leetcode") {
        try {
          await fetchPlatforms();
        } catch (err) {
          if (DEBUG) console.error("❌ post-sync refresh failed:", err);
          alert("Sync succeeded, but failed to refresh platforms. Please refresh the page.");
        }
      }
    } catch (err) {
      // If LeetCode POST is flaky: treat transient issues as background sync instead of hard fail
      if (platformId === "leetcode") {
        if (DEBUG) console.error("LeetCode sync POST error (treating as pending):", err);
        // optimistic connect
        setPlatforms(prev =>
          prev.map(p =>
            p.id === "leetcode" ? { ...p, isConnected: true, username } : p
          )
        );
        closeModal();
        const ok = await pollUntilConnected({ platformId: "leetcode" });
        if (!ok) {
          alert("LeetCode is still syncing in the background. You can continue and refresh later.");
        }
      } else {
        if (DEBUG) console.error("❌ sync failed:", err);
        const msg = err.response?.data?.message || "Sync failed—check console for details.";
        alert(msg);
      }
    } finally {
      setIsConnecting(false);
    }
  }

  // 4️⃣ Disconnect a platform
  async function handleDisconnect(platformId) {
    try {
      await axios.patch("/api/user/platforms", { platforms: { [platformId]: "" } });
      await fetchPlatforms();
    } catch (err) {
      if (DEBUG) console.error("❌ disconnect failed:", err);
      alert("Disconnect failed—check console for details.");
    }
  }

  // 5️⃣ Save & Continue
  function saveAndContinue() {
    if (platforms.some(p => p.isConnected)) {
      sessionStorage.removeItem("dashboardCache:v1");
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
