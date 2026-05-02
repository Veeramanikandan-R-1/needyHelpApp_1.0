const { Router } = require("express");
const UserRouter = require("./controllers/user");
const ScholarshipRouter = require("./controllers/scholarship");
const SponsorshipRouter = require("./controllers/sponsorship");
const router = Router();

router.use("/v1/user", UserRouter);
router.use("/v1/scholarships", ScholarshipRouter);
router.use("/v1/sponsorships", SponsorshipRouter);

module.exports = router;