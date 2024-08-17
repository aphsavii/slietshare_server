import axios from "axios";

const baseUrls = {
  codeforces: "https://codeforces.com/api/user.info?handles=",
  gfg: "https://authapi.geeksforgeeks.org/api-get/user-profile-info/?handle=",
  leetcode: "https://alfa-leetcode-api.onrender.com/",
};

const validateProfile = async (req, res) => {
  const { platform, username } = req.body;
  try {
    const response = await axios.get(baseUrls[platform] + username);
    if (platform == "gfg") {
      return res.status(200).json({
        error: false,
        message: "Profile is valid",
      });
    }
    if (platform == "codeforces") {
      return res.status(200).json({
        error: false,
        message: "Profile is valid",
      });
    }
    if (platform == "leetcode") {
      if(response.data.errors) {
        return res.status(404).json({
          error: true,
          message: "Profile is invalid",
        });
      }
      return res.status(200).json({
        error: false,
        message: "Profile is valid",
      });
    }
  } catch (error) {
    return res.status(404).json({
      error: true,
      message: "Profile is invalid",
    });
  }
};

export { validateProfile };
