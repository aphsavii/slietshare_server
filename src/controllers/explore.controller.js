import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
// Helper function to create a regex pattern for flexible skill matching
const createSkillRegex = (skill) => {
  const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escapedSkill.split("").join(".*");
  return new RegExp(pattern, "i");
};

const explore = asyncHandler(async (req, res) => {
  const { user } = req;
  const { page = 1, limit = 10 } = req.query;
  const { batches, programmes, trades, skills, sort } = req.body;

  if (!batches && !programmes && !trades && !skills) {
    return res
      .status(400)
      .json(new ApiError(400, "At least one filter is required"));
  }

  const filters = {};
  if (batches) filters.batch = { $in: batches };
  if (programmes) filters.programme = { $in: programmes };
  if (trades) filters.trade = { $in: trades };

  filters.regno = { $nin : [1111111, 2010215,2010247] };

  if (skills && skills.length > 0) {
    filters.$and = skills.map((skill) => ({
      skills: {
        $elemMatch: {
          skill: createSkillRegex(skill),
        },
      },
    }));
  }

  try {
    // const users = await User.find(filters)
    //   .limit(parseInt(limit))
    //   .skip((parseInt(page) - 1) * parseInt(limit)).select(
    //     "-password -email -phone -createdAt -updatedAt -__v -role batch programme name trade regno skills avatarUrl headLine"
    //   );
    // aggregate query to get all users with the filter
    const users = await User.aggregate([
      { $match: filters },

      {
        // Join with the follow collection and get the followers array
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "following",
          as: "followers",
        },
      },
      {
        // Add a field to count the number of followers
        $addFields: {
          followersCount: { $size: "$followers" },
        },
      },
      {
        $project: {
          fullName: 1,
          regno: 1,
          batch: 1,
          programme: 1,
          trade: 1,
          skills: 1,
          avatarUrl: 1,
          headLine: 1,
          followersCount: 1,
          createdAt: 1,
        },
      },
      {
        $match: {
          regno: { $nin: [0, 2010215] },
        },
      },
      // Sort the users by followers count
      // sort only if the sort query is provided
      {
        $sort: sort
          ? { followersCount: sort === "asc" ? 1 : -1 }
          : { createdAt: 1 },
      },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    return res
      .status(200)
      .json(new ApiResponse(200, "Users fetched successfully", users));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching users", error));
  }
});

export { explore };
