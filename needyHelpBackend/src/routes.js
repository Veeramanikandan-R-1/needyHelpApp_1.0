const { Router } = require("express");
const UserRouter = require("./controllers/user");
const router = Router();

router.use("/v1/user", UserRouter);

module.exports = router;