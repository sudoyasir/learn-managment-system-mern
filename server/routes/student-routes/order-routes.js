const express = require("express");
const {
  createOrder,
} = require("../../controllers/student-controller/order-controller");

const router = express.Router();

router.post("/create", createOrder);

module.exports = router;
