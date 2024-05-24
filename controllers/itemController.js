const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require('fs').promises;

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Appending extension with original name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Cloudinary config
cloudinary.config({ 
  cloud_name: 'dfubtb083', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

function uploadToCloudinary(image) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, (err, result) => {
      if (err) return reject(err);
      return resolve(result.url);
    })
  });
}

exports.item_list = asyncHandler(async (req, res, next) => {
  const items = await Item.find({}, "name image_url").exec();

  res.render("item_list", {
    title: "All Items",
    item_list: items,
  });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  res.render("item_detail", {
    title: "Item",
    item: item,
  });
});

// Item create GET
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}, "name").exec();
  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
  });
});

// item create POST
exports.item_create_post = [
  upload.single("image"),

  body("name")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("Name must be specified"),
  body("category")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category must be specified"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Price must be specified"),
  body("in_stock")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("In-stock value must be specified"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let image_url = null;
    if (req.file) {
      image_url = await uploadToCloudinary(`uploads/${req.file.filename}`);
      // Delete file after uploading
      await fs.unlink(req.file.path);
    }

    // Create item object with escaped and trimmed data
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      in_stock: req.body.in_stock,
      image_url: image_url,
    });

    if (!errors.isEmpty()) {
      const allCategories = await Category.find({}, "name");
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("item_form", {
        title: "Create item",
        item: item,
        categories: allCategories,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save item.
      await item.save();
      // Redirect to new item record.
      res.redirect(item.url);
    }
  }),
];

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find({}, "name").exec()
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    item: item,
    categories: allCategories
  });
});

exports.item_update_post = [
  upload.single("image"),

  body("name")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("Name must be specified"),
  body("category")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category must be specified"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Price must be specified"),
  body("in_stock")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("In-stock value must be specified"),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    let image_url = null;
    if (req.file) {
      image_url = await uploadToCloudinary(`uploads/${req.file.filename}`);
       // Delete file after uploading
       await fs.unlink(req.file.path);
    }

    let item = null;
    if (image_url) {
      item = new Item({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        in_stock: req.body.in_stock,
        image_url: image_url,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });
    } else {
      item = new Item({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        in_stock: req.body.in_stock,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });
    }

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("item_form", {
        title: "Update item",
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      // Redirect to item detail page.
      res.redirect(updatedItem.url);
    }
  })
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    res.redirect("/inventory/categories");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    res.render("item_delete", {
      title: "Delete item",
      item: item,
    });
    return;
  } else {
    // Delete object and redirect to the list of items.
    await Item.findByIdAndDelete(req.body.itemid);
    res.redirect("/inventory/items");
  }
});
