const Category = require("../models/category");
const Item = require("../models/item");

const asyncHandler = require("express-async-handler");

exports.item_list = asyncHandler(async (req, res, next) => {
    const items = await Item.find({}, "name image_url").exec();

    res.render("item_list", {
        title: "All Items",
        item_list: items,
    })
})