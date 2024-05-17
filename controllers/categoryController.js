const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    const [numCategories, numItems] = await Promise.all([
        Category.countDocuments().exec(),
        Item.countDocuments().exec()
    ])

    res.render("index", {
        title: "Inventory",
        category_count: numCategories,
        item_count: numItems
    })
})