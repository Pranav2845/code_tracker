const fetch = require('node-fetch');

exports.getStats = async (username) => {
  const query = {
    query: `
      query {
        matchedUser(username: "${username}") {
          username
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `
  };

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  const data = await res.json();
  return data.data.matchedUser;
};
