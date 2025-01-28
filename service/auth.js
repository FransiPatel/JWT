// service/auth.js
const sessionIdToUserMap = new Map();

function setUser(id, user) {
    sessionIdToUserMap.set(id, user); // Map session ID to user object
}

function getUser(id) {
    // console.log('Fetching user for ID:', id); // Debugging
    return sessionIdToUserMap.get(id); // Retrieve user from session map
}

module.exports = {
    setUser,
    getUser,
};
