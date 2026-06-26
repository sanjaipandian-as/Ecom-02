import Category from "../models/Category.js";
import { storage } from "../services/storage/index.js";

export const addCategory = async (req, res) => {
  try {
    const { name, displayOrder, showInTopbar } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // ─── Icon upload via StorageService ───
    let iconRelativePath = null;
    if (req.file) {
      const { relativePath } = await storage.store(req.file.path, 'categories');
      iconRelativePath = relativePath;
    }

    const category = await Category.create({
      name,
      icon: iconRelativePath,
      displayOrder: displayOrder || 0,
      showInTopbar: showInTopbar === 'true' || showInTopbar === true
    });

    return res.json({
      message: "Category created successfully",
      category
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    // Sort by displayOrder ascending, then by name ascending
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, displayOrder, showInTopbar } = req.body;

    // Fetch current category to get old icon path for cleanup
    const currentCategory = await Category.findById(categoryId);
    if (!currentCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const oldIconPath = currentCategory.icon;

    // ─── Icon upload via StorageService ───
    let iconRelativePath = undefined; // undefined = don't update icon
    if (req.file) {
      const { relativePath } = await storage.store(req.file.path, 'categories');
      iconRelativePath = relativePath;
    }

    const updated = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        displayOrder,
        showInTopbar: showInTopbar === 'true' || showInTopbar === true,
        ...(iconRelativePath !== undefined && { icon: iconRelativePath }),
      },
      { new: true }
    );

    // ─── Cleanup: delete old icon if it was replaced ───
    if (iconRelativePath && oldIconPath && oldIconPath !== iconRelativePath) {
      storage.delete(oldIconPath).catch(err => {
        console.error('[Category Update] Failed to clean up old icon:', err.message);
      });
    }

    return res.json({
      message: "Category updated",
      updated
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    await Category.findByIdAndUpdate(categoryId, { isActive: false });

    // Note: Icon is NOT deleted on soft-delete (isActive: false).
    // The icon is preserved for potential re-activation.

    return res.json({
      message: "Category disabled"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
