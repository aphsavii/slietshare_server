import { Router } from "express";
import { getCodeforcesLeaderboard, getGFGLeaderboard } from "../controllers/leaderboard.controller.js";
const leaderboardRouter = Router();

leaderboardRouter.get("/gfg", getGFGLeaderboard);
leaderboardRouter.get("/codeforces",getCodeforcesLeaderboard);

export default leaderboardRouter;