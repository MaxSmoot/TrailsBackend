import express from "express";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    res.status(200);
    res.send({ auth: true, profile: "your profile" });
  })
);

export default router;
