const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const fs = require('fs').promises;

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Appending extension with original name
    cb(null, file.originalname) 
  }
})

const upload = multer({ storage: storage });

exports.index = asyncHandler(async (req, res, next) => {
  const [numCategories, numItems] = await Promise.all([
    Category.countDocuments().exec(),
    Item.countDocuments().exec(),
  ]);

  res.render("index", {
    title: "Inventory",
    category_count: numCategories,
    item_count: numItems,
  });
});

exports.category_list = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({}, "name image_url").exec();

  res.render("category_list", {
    title: "All Categories",
    category_list: categories,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name image_url").exec()
  ]);

  res.render("category_detail", {
    title: "Category",
    category: category,
    item_list: allItemsInCategory
  });
});

// Category create GET
exports.category_create_get = (req, res, next) => {
  res.render("category_form", {
    title: "Create Category",
  });
};

// Category create POST
exports.category_create_post = [
  upload.single("image"),

  body("name")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("Name must be specified"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let image_url = null;
    if (req.file) {
      image_url = await uploadToCloudinary(`uploads/${req.file.filename}`);
      // Delete file after uploading
      await fs.unlink(req.file.path);
    }
    
    // Create Category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      image_url: image_url
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save category.
      await category.save();
      // Redirect to new category record.
      res.redirect(category.url);
    }
  })
];

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category,
  });
});

exports.category_update_post = [
  upload.single("image"),

  body("name")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("Name must be specified"),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    let image_url = null;
    if (req.file) {
      image_url = await uploadToCloudinary(`uploads/${req.file.filename}`);
       // Delete file after uploading
       await fs.unlink(req.file.path);
    }

    let category = null;
    if (image_url) {
      category = new Category({
        name: req.body.name,
        description: req.body.description,
        image_url: image_url,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });
    } else {
      category = new Category({
        name: req.body.name,
        description: req.body.description,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });
    }

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      // Redirect to category detail page.
      res.redirect(updatedCategory.url);
    }
  })
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all their books (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name image_url").exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/inventory/categories");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    category_items: allItemsByCategory,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their books (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name image_url").exec(),
  ]);

  if (allItemsByCategory.length > 0) {
    // category has items. Render in same way as for GET route.
    res.render("category_delete", {
      title: "Delete category",
      category: category,
      category_items: allItemsByCategory,
    });
    return;
  } else {
    // category has no books. Delete object and redirect to the list of categories.
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/inventory/categories");
  }
});
