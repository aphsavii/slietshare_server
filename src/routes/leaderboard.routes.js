import { Router } from "express";
import { getCodeforcesLeaderboard, getGFGLeaderboard, getLeetcodeLeaderboard } from "../controllers/leaderboard.controller.js";
const leaderboardRouter = Router();

leaderboardRouter.get("/gfg", getGFGLeaderboard);
leaderboardRouter.get("/codeforces",getCodeforcesLeaderboard);
leaderboardRouter.get("/leetcode",getLeetcodeLeaderboard);

export default leaderboardRouter;