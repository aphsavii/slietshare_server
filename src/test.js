import axios from "axios";
const query = `#graphql
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
}`;
const getLeetCodeData = async (userName) => {
    const response = await axios.post('https://leetcode.com/graphql', {
        query: query,
        variables: {
            username: userName, //username required
        },
    });

    const result  = {
        constestRating: response.data.data.userContestRanking.rating,
        globalRank: response.data.data.userContestRanking.globalRanking,
        questionsSolved: response.data.data.matchedUser.submitStats.acSubmissionNum[0].count + '/' + response.data.data.allQuestionsCount[0].count,
        stars : response.data.data.matchedUser.profile.starRating,
    }
    return res;
};

const userNames = ['aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii', 'aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii','aphs_avii','aphs_avii', 'aphs_avii', ];

const allLeetCodeData = async (userNames) => {
    const data = await Promise.all(userNames.map(async (userName) => {
        return await getLeetCodeData(userName);
    }));
    return data;
}

// allLeetCodeData(userNames).then(data => {
//     console.log(data);
// }).catch(err => {
//     console.log(err);
// });

getLeetCodeData('aphs_avii').then(data => {
    console.dir(data, { depth: null });
});