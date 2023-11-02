const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({ include: Product });
    tagData
      ? res.status(200).json(tagData)
      : res.status(404).json({ Error: "Tag not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async ({ params: { id } }, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await tagData.findByPk(id, { include: Product });
    tagData
      ? res.status(200).json(tagData)
      : res.status(404).json({ Error: "Tag with such id was not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async ({ body }, res) => {
  // create a new tag
  try {
    const { productIds, ...tagData } = body;
    const newTag = await Tag.create(body);
    // If there are associated products, create pairings in the ProductTag model

    if (productIds && productIds.length) {
      const productTagIdArray = productIds.map((product_id) => ({
        tag_id: newTag.id,
        product_id,
      }));
      await ProductTag.bulkCreate(productTagIdArray);
    }
    newTag
      ? res.status(200).json(newTag)
      : res.status(404).json({ error: "Failed to create a new tag" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async ({ params: { id }, body }, res) => {
  // update a tag's name by its `id` value
  try {
    const tagToUpdate = await Tag.findByPk(id);
    if (!tagToUpdate) {
      return res.status(404).json({ Error: "Tag with such id was not found" });
    }

    await tagToUpdate.update(body);
    res.status(200).json(tagToUpdate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async ({ params: { id } }, res) => {
  // delete on tag by its `id` value
  try {
    const tagToDelete = await Tag.findByPk(id);
    if (!tagToDelete) {
      return res.status(404).json({ Error: "Tag with such id was not found" });
    }
    await tagToDelete.destroy();
    res.status(200).json(tagToDelete);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
