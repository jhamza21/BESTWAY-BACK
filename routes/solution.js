const Solution = require("../models/solution");
const verifyToken = require("./verifyToken");
const router = require("express").Router();

//GET SOLUTION
router.get("/", verifyToken, async (req, res) => {
    try {
        const solution = await Solution.findOne({ id_user: req.user._id });
        res.json(solution);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;