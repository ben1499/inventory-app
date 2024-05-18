const express = require("express");
const router = express.Router();

const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");

router.get("/", category_controller.index);

router.get("/categories", category_controller.category_list);

router.get("/items", item_controller.item_list);

module.exports = router;