import axios from "axios";
import {
  LEETCODE_BASE_URL,
  CODEFORCES_BASE_URL,
  GFG_BASE_URL,
  LEETCODE_GQL_QUERY,
} from "../constants.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getLastRouteSegment = (url) => {
  url = url.replace(/\/$/, "");
  const segments = url.split("/");
  return segments[segments.length - 1];
};

const getLeetCodeData = async (userName) => {
  try {
    const response = await axios.post(LEETCODE_BASE_URL, {
      query: LEETCODE_GQL_QUERY,
      variables: {
        username: userName,
      },
    });
    const result = {
      username: userName,
      constestRating: response.data.data?.userContestRanking?.rating,
      globalRank: response.data.data?.userContestRanking?.globalRanking,
      questionsSolved:
        response.data.data.matchedUser.submitStats.acSubmissionNum[0].count +
        "/" +
        response.data.data.allQuestionsCount[0].count,
      stars: response.data.data.matchedUser.profile.starRating,
      ranking: response.data.data.matchedUser.profile.ranking,
    };
    return result;
  } catch (error) {
    console.log(error, error);
    return null;
  }
};

const getCodeforcesData = async (usernames) => {
  const firstUser = usernames[0] + ";";
  const userNames = usernames.reduce((acc, curr) => {
    return acc + curr + ";";
  }, firstUser);
  try {
    const response = await axios.get(
      `${CODEFORCES_BASE_URL}user.info?handles=${userNames}`
    );
    const data = response.data.result;
    let users = data.map((user) => {
      return {
        username: user.handle,
        rating: user.rating,
        maxRating: user.maxRating,
        rank: user.rank,
        maxRank: user.maxRank,
      };
    });
    users = users.slice(1, usernames.length + 1);
    return {
      error: false,
      users,
    };
  } catch (error) {
    // console.log(error);
    return {
      error: true,
      message: error.message,
    };
  }
};
const getGFGData = async (username) => {
  try {
    const response = await axios.get(
      `${GFG_BASE_URL}user-profile-info/?handle=${username}`
    );
    const data = response.data.data;
    return {
      error: false,
      data: {
        username: username,
        score: data.score,
        problemsSolved: data.total_problems_solved,
        streak: data.pod_solved_longest_streak,
      },
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
};

const allUsersLeetcodeData = async (userNames) => {
  const data = await Promise.all(
    userNames.map(async (userName) => {
      return await getLeetCodeData(userName);
    })
  );
  return data;
};

const allUsersCodeforcesData = async (usernames) => {
  const data = await getCodeforcesData(usernames);
  return data;
};

const allUsersGFGData = async (usernames) => {
  const data = await Promise.all(
    usernames.map(async (username) => {
      return await getGFGData(username);
    })
  );
  return data;
};

const getCodeforcesLeaderboard = asyncHandler(async (req, res) => {
  // Fetch users with Codeforces links from the database
  const codeforcesUsers = await User.find({
    "socialLinks.codeforces": { $type: "string", $ne: "" },
  }).select("fullName socialLinks.codeforces regno");

  // Extract usernames from the social links
  const codeforcesUsernames = codeforcesUsers.map((user) => ({
    regno: user.regno,
    username: getLastRouteSegment(user.socialLinks.codeforces),
  }));

  // Fetch Codeforces data from the API
  let codeforcesData = [];
  try {
    const codeforcesApiResponse = await allUsersCodeforcesData(
      codeforcesUsernames.map((user) => user.username)
    );

    // Process Codeforces API response
    if (!Array.isArray(codeforcesApiResponse.users)) {
      throw new Error(
        "Codeforces API did not return an array of users as expected."
      );
    }
    codeforcesData = codeforcesApiResponse.users;
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError("Something went wrong", 500, ["Error fetching Data"]));
  }

  // Merge the API data with the corresponding user information
  const mergedCodeforcesData = codeforcesUsers.map((user) => {
    const apiData = codeforcesData.find(
      (data) =>
        data.username === getLastRouteSegment(user.socialLinks.codeforces)
    );
    return { ...user.toObject(), codeforcesData: apiData || null };
  });

  // Sort the users:
  // 1. Users with maxRating (sorted by maxRating in descending order)
  // 2. Users without maxRating at the end
  const sortedCodeforcesData = mergedCodeforcesData.sort((a, b) => {
    const maxRatingA = a.codeforcesData?.maxRating;
    const maxRatingB = b.codeforcesData?.maxRating;

    if (maxRatingA != null && maxRatingB != null) {
      return maxRatingB - maxRatingA;
    }
    if (maxRatingA != null) return -1;
    if (maxRatingB != null) return 1;
    return 0; // Both users don't have maxRating, keep their relative order
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Data fetched Successfully", sortedCodeforcesData)
    );
});

const getGFGLeaderboard = asyncHandler(async (req, res) => {
  // Fetch users with GFG links from the database
  const gfgUsers = await User.find({
    "socialLinks.gfg": { $type: "string", $ne: "" },
  }).select("fullName socialLinks.gfg regno");

  // Extract usernames from the social links
  const gfgUsernames = gfgUsers.map((user) => ({
    regno: user.regno,
    username: getLastRouteSegment(user.socialLinks.gfg),
  }));

  // Fetch GFG data from the API
  let gfgData = [];
  try {
    const gfgApiResponse = await allUsersGFGData(
      gfgUsernames.map((user) => user.username)
    );

    // Process GFG API response
    if (!Array.isArray(gfgApiResponse)) {
      throw new Error("GFG API did not return an array as expected.");
    }
    gfgData = gfgApiResponse;
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", ["Error fetching data"]));
  }

  // Merge the API data with the corresponding user information
  const mergedGfgData = gfgUsers.map((user) => {
    const apiData = gfgData.find(
      (data) => data.data.username === getLastRouteSegment(user.socialLinks.gfg)
    );
    return { ...user.toObject(), gfgData: apiData ? apiData.data : null };
  });

  const sortedGfgData = mergedGfgData.sort((a, b) => {
    if (!a.gfgData) return 1;
    if (!b.gfgData) return -1;
    return b.gfgData.score - a.gfgData.score;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "data fetched sucessfully", sortedGfgData));
});

const getLeetcodeLeaderboard = asyncHandler(async (req, res) => {
  // Fetch users with LeetCode links from the database
  const leetcodeUsers = await User.find({
    "socialLinks.leetcode": { $type: "string", $ne: "" },
  }).select("fullName socialLinks.leetcode regno");

  

  // Extract usernames from the social links
  const leetcodeUsernames = leetcodeUsers.map((user) => ({
    regno: user.regno,
    username: getLastRouteSegment(user.socialLinks.leetcode),
  }));

  // return res.send(leetcodeUsernames);

  // Fetch LeetCode data from the API
  let leetcodeData = [];
  try {
    const leetcodeApiResponse = await allUsersLeetcodeData(
      leetcodeUsernames.map((user) => user.username)
    );

    // Process LeetCode API response
    if (!Array.isArray(leetcodeApiResponse)) {
      throw new Error("LeetCode API did not return an array as expected.");
    }
    leetcodeData = leetcodeApiResponse;
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", ["Error fetching data"]));
  }

  // Merge the API data with the corresponding user information
  const mergedLeetcodeData = leetcodeUsers.map((user) => {
    const apiData = leetcodeData.find(
      (data) => data?.username === getLastRouteSegment(user.socialLinks.leetcode) 
    );
    return { ...user.toObject(), leetcodeData: apiData || null };
  });

  // Helper function to get the number of problems solved
  const getProblemsSolved = (user) => {
    if (!user?.leetcodeData || !user?.leetcodeData?.questionsSolved) return 0;
    const solved = user.leetcodeData.questionsSolved.split('/')[0];
    return parseInt(solved, 10) || 0;
  };

  // Sort the users:
  // 1. Users with valid contestRating (sorted by contestRating in descending order)
  // 2. Users without contestRating (sorted by problemsSolved in descending order)
  const sortedLeetcodeData = mergedLeetcodeData.sort((a, b) => {
    const ratingA = a.leetcodeData?.contestRating || a.leetcodeData?.constestRating;
    const ratingB = b.leetcodeData?.contestRating || b.leetcodeData?.constestRating;

    if (ratingA != null && ratingB != null) {
      return ratingB - ratingA;
    }
    if (ratingA != null) return -1;
    if (ratingB != null) return 1;
    return getProblemsSolved(b) - getProblemsSolved(a);
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Data fetched successfully", sortedLeetcodeData)
    );
});

export { getGFGLeaderboard, getCodeforcesLeaderboard, getLeetcodeLeaderboard };
