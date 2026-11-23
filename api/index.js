try {
    module.exports = require('../backend/app');
} catch (e) {
    module.exports = (req, res) => res.status(500).json({ error: e.message });
}
