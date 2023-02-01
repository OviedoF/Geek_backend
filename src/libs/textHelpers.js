const capitalize = (text) => {
    const lower = text.toLowerCase();
    return text.charAt(0).toUpperCase() + lower.slice(1);
}

module.exports = {
    capitalize
}