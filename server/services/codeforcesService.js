const fetch = require('node-fetch');

exports.getStats = async (username) => {
  const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
  const data = await res.json();
  return data.result[0]; // returns rating, rank, etc.
};
