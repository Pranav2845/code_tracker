import express from "express";
const router = express.Router();

// POST /api/platforms/connect
router.post("/connect", async (req, res) => {
  const { platform } = req.body;
  // TODO: Update DB or session to mark platform as connected
  res.json({ message: `${platform} connected` });
});

// POST /api/platforms/disconnect
router.post("/disconnect", async (req, res) => {
  const { platform } = req.body;
  // TODO: Update DB or session to mark platform as disconnected
  res.json({ message: `${platform} disconnected` });
});

export default router;
