const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String },
  price: { type: Number, required: true },
  in_stock: { type: Number, required: true },
  image_url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  is_default: { type: Boolean, default: false }
});

ItemSchema.virtual("url").get(function () {
  return `/inventory/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);