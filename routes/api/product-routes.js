const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  // find all products
  try {
    const productData = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ["id", "category_name"],
        },
        {
          model: Tag,
          attributes: ["id", "tag_name"],
        },
      ],
    });
    productData
      ? res.status(200).json(productData)
      : res.status(404).json({ Error: "Products not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get one product
router.get("/:id", async ({ params: { id } }, res) => {
  // find a single product by its `id`
  try {
    const productData = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          attributes: ["id", "category_name"],
        },
        {
          model: Tag,
          attributes: ["id", "tag_name"],
        },
      ],
    });
    productData
      ? res.status(200).json(productData)
      : res.status(404).json({ Error: "Products not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// create new product
router.post("/", async ({ body }, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    const { tagIds, ...productData } = body;
    const newProduct = await Product.create(productData);

    // If there are product tags, create pairings in the ProductTag model
    if (tagIds && tagIds.length) {
      const productTagIdArray = tagIds.map((tag_id) => ({
        product_id: newProduct.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArray);
    }
    newProduct
      ? res.status(200).json(newProduct)
      : res.status(404).json({ error: "Failed to create a new product" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update product
router.put("/:id", async ({ params: { id }, body }, res) => {
  try {
    // Check if the product with the specified ID exists
    const productToUpdate = await Product.findByPk(id);
    if (!productToUpdate) {
      return res
        .status(404)
        .json({ Error: "Product with such id was not found" });
    }

    await productToUpdate.update(body);

    if (body.tagIds && body.tagIds.length) {
      const existingProductTags = await ProductTag.findAll({ product_id: id });

      const existingTagIds = existingProductTags.map(({ tag_id }) => tag_id);
      const newTagIds = body.tagIds.filter(
        (tag_id) => !existingTagIds.includes(tag_id)
      );

      const productTagsToRemove = existingProductTags
        .filter(({ tag_id }) => !body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ id: productTagsToRemove }),
        ProductTag.bulkCreate(
          newTagIds.map((tag_id) => ({
            product_id: id,
            tag_id,
          }))
        ),
      ]);
    }
    res.status(200).json(productToUpdate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async ({ params: { id } }, res) => {
  try {
    const productToDelete = await Product.findByPk(id);
    if (!productToDelete) {
      return res
        .status(404)
        .json({ Error: "Category with such id was not found" });
    }
    await productToDelete.destroy();
    res.status(200).json(productToDelete);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
