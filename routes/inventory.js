const express = require("express");
const router = express.Router();

const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");

router.get("/", category_controller.index);

// CATEGORY ROUTES
router.get("/categories", category_controller.category_list);

// Category create GET
router.get("/category/create", category_controller.category_create_get);

// Category create POST
router.post("/category/create", category_controller.category_create_post);

router.get("/category/:id", category_controller.category_detail);

// Category update GET
router.get("/category/:id/update", category_controller.category_update_get);

// Category update POST
router.post("/category/:id/update", category_controller.category_update_post);

// Category delete GET
router.get("/category/:id/delete", category_controller.category_delete_get);

// Category delete POST
router.post("/category/:id/delete", category_controller.category_delete_post);

// ITEM ROUTES
router.get("/items", item_controller.item_list);

// Item create GET
router.get("/item/create", item_controller.item_create_get);

// Item create POST
router.post("/item/create", item_controller.item_create_post);

router.get("/item/:id", item_controller.item_detail);

// Item create GET
router.get("/item/:id/update", item_controller.item_update_get)

// Item create POST
router.post("/item/:id/update", item_controller.item_update_post)

// Item delete GET
router.get("/item/:id/delete", item_controller.item_delete_get);

// Item delete POST
router.post("/item/:id/delete", item_controller.item_delete_post);


module.exports = router;