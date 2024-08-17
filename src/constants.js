const DEFAULT_AVATAR = "https://res.cloudinary.com/dejbo7uw5/image/upload/v1711738910/avatar/ayl1ptnlmgi43ymkipv6.jpg";
const LEETCODE_BASE_URL = "https://leetcode.com/graphql";
const LEETCODE_GQL_QUERY = `
#graphql
query getUserProfile($username: String!) {
    allQuestionsCount {
        difficulty
        count
    }
    userContestRanking(username: $username){
        rating
        globalRanking
    }
    matchedUser(username: $username) {
        profile {
            realName
            ranking
            reputation
            starRating
        }
        submitStats {
            acSubmissionNum {
                difficulty
                count
                submissions
            }
        }
    }
}
`;
const CODEFORCES_BASE_URL = "https://codeforces.com/api/";
const GFG_BASE_URL = "https://authapi.geeksforgeeks.org/api-get/";

export {
DEFAULT_AVATAR,
LEETCODE_BASE_URL,
LEETCODE_GQL_QUERY,
CODEFORCES_BASE_URL,
GFG_BASE_URL,
}