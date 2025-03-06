import axios from "axios";
import mongoose from "mongoose";
import Products from "./models/Products"; 

const fetchDummyProducts = async () => {
  try {
    const response = await axios.get("https://dummyjson.com/products");
    const dummyProducts = response.data.products;

    const formattedProducts = dummyProducts.map((p: any) => ({
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      discountPercentage: p.discountPercentage,
      rating: p.rating,
      stock: p.stock,
      tags: p.tags,
      brand: p.brand,
      weight: p.weight,
      dimensions: {
        width: p.dimensions?.width || 0,
        height: p.dimensions?.height || 0,
        depth: p.dimensions?.depth || 0,
      },
      warrantyInformation: p.warrantyInformation || "",
      shippingInformation: p.shippingInformation || "",
      availabilityStatus: p.availabilityStatus || "",
      reviews: p.reviews || [],
      returnPolicy: p.returnPolicy || "",
      minimumOrderQuantity: p.minimumOrderQuantity || 1,
      images: p.images,
      thumbnail: p.thumbnail,
    }));

    await Products.insertMany(formattedProducts);
    console.log("Dummy products imported successfully!");
  } catch (error) {
    console.error("Error importing dummy products:", error);
  } finally {
    mongoose.connection.close();
  }
};

mongoose.connect("mongodb+srv://hashnj:Njoshi%40%2345@cluster0.qhvhkeg.mongodb.net/proj?retryWrites=true&w=majority", {}).then(() => {
  console.log("Connected to database.");
  fetchDummyProducts();
});
