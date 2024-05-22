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

exports.item_detail = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate("category").exec();

    res.render("item_detail", {
        title: "Item",
        item: item,
    })
})