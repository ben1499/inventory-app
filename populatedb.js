#! /usr/bin/env node

console.log(
    'This script populates some test categories and items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Category = require("./models/category");
  const Item = require("./models/item");

  const cloudinary = require("cloudinary").v2;

  cloudinary.config({ 
    cloud_name: 'dfubtb083', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  });
  
  const categories = [];
  const items = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }

  function uploadToCloudinary(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image, (err, result) => {
        if (err) return reject(err);
        return resolve(result.url);
      })
    });
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // genre[0] will always be the Fantasy genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function categoryCreate(index, name, description, image_url, is_default) {
    const category = new Category({ name: name, description: description, image_url:image_url, is_default: is_default });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }

  async function itemCreate(index, name, description, price, in_stock, category, image_url, is_default) {
    const item = new Item({ name, description, price, in_stock, category, image_url, is_default });
    await item.save();
    items[index] = item;
    console.log(`Added item: ${name}`);
  }

  async function createCategories() {
    console.log("Adding categories");

    const images = await Promise.all([
      uploadToCloudinary("./public/images/electronics.jpg"),
      uploadToCloudinary("./public/images/clothing.jpg"),
      uploadToCloudinary("./public/images/furniture.jpg"),
    ])

    await Promise.all([
      categoryCreate(0, 
        "Electronics", 
        "The Electronics category encompasses a wide range of products that involve electric or electronic components. This category includes items such as computers, laptops, tablets, smartphones, televisions, audio equipment, cameras, gaming consoles, and various other electronic devices.",
        images[0],
        true
      ),
      await categoryCreate(1, 
        "Clothing", 
        "The Clothing category offers a vast collection of apparel items for men, women, and children. From everyday essentials to fashionable statements, this category aims to cater to diverse styles and preferences.",
        images[1],
        true
      ),
      await categoryCreate(2, 
        "Furniture", 
        "The Furniture category is a comprehensive collection of pieces designed to furnish and enhance various living spaces. Whether you're outfitting a new home, redecorating, or simply replacing worn-out items, this category offers a wide range of furniture options to suit your style and functional needs.",
        images[2],
        true
      ),
    ])
  }

  async function createItems() {
    console.log("Adding items");

    const images = await Promise.all([
      uploadToCloudinary("./public/images/laptop.jpg"),
      uploadToCloudinary("./public/images/phone.jpg"),
      uploadToCloudinary("./public/images/tshirt.jpg"),
      uploadToCloudinary("./public/images/shirt.jpg"),
      uploadToCloudinary("./public/images/armchair.jpg"),
      uploadToCloudinary("./public/images/sofa.jpg"),
    ])

    await Promise.all([
      itemCreate(0, 
        "MacBook", 
        "The MacBook is a high-performance laptop computer designed and manufactured by Apple Inc. Known for its sleek and minimalist aesthetics, the MacBook combines powerful hardware with Apple's intuitive macOS operating system, providing a seamless and efficient computing experience.",
        120000.00,
        20,
        categories[0],
        images[0],
        true
      ),
      itemCreate(1, 
        "iPhone", 
        "The iPhone is Apple's flagship smartphone, renowned for its cutting-edge technology, sleek design, and seamless integration with the company's ecosystem of products and services. Crafted with meticulous attention to detail, the iPhone combines powerful hardware with intuitive software, providing an exceptional user experience that has set industry standards for over a decade.",
        95000.00,
        10,
        categories[0],
        images[1],
        true
      ),
      itemCreate(2, 
        "Black T-Shirt", 
        "Premium black t-shirt made with 100% cotton. Made stretchable and breathable for your everyday hustle. Suitable for workouts and everyday use",
        1200.00,
        30,
        categories[1],
        images[2],
        true
      ),
      itemCreate(3, 
        "Format Shirt", 
        "Premium format shirt made with 100% cotton. Comfortable and breathable for the working man. Wrinkle free and durable",
        1600.00,
        20,
        categories[1],
        images[3],
        true
      ),
      itemCreate(4, 
        "Armchair", 
        "Stylish and modern armchair with a mid-century modern design aesthetic. The chair features a soft, pastel pink upholstery that gives it a warm and inviting appearance. The seat and backrest are generously padded and tufted, creating a cozy and comfortable seating experience.",
        9999.00,
        5,
        categories[2],
        images[4],
        true
      ),
      itemCreate(5, 
        "Rustic Orange Loveseat Sofa", 
        "This compact yet cozy loveseat features a warm rust-orange upholstered body made of durable textured fabric. The simple modern design with clean lines and small footprint makes it perfect for apartments or cozy living spaces.",
        15000.00,
        7,
        categories[2],
        images[5],
        true
      )
    ])
  }
  
  