const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  try {
    const categoryData = await Category.findAll({ include: Product });
    categoryData
      ? res.status(200).json(categoryData)
      : res.status(404).json({ Error: "Category not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async ({ params: { id } }, res) => {
  // find one category by its `id` value
  try {
    const categoryData = await Category.findByPk(id, { include: Product });
    categoryData
      ? res.status(200).json(categoryData)
      : res.status(404).json({ Error: "Category with such id was not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
  // be sure to include its associated Products
});

router.post("/", (req, res) => {
  // create a new category
});

router.put("/:id", (req, res) => {
  // update a category by its `id` value
});

router.delete("/:id", (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
