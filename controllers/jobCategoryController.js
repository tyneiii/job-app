const JobCategory = require('../models/JobCategory');

module.exports = {
    createCategory: async (req, res) => {
        try {
            const { title, description } = req.body;
            if (!title || !description) {
                return res.status(400).json({ message: "Title and description are required." });
            }

            const newCategory = new JobCategory(req.body);
            const savedCategory = await newCategory.save();
            res.status(201).json(savedCategory);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const updatedCategory = await JobCategory.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );

            if (!updatedCategory) {
                return res.status(404).json({ message: "Category not found." });
            }

            res.status(200).json(updatedCategory);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const deletedCategory = await JobCategory.findByIdAndDelete(req.params.id);
            if (!deletedCategory) {
                return res.status(404).json({ message: "Category not found." });
            }

            res.status(200).json({ message: "Category deleted successfully." });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCategory: async (req, res) => {
        try {
            const category = await JobCategory.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ message: "Category not found." });
            }

            res.status(200).json(category);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllCategories: async (req, res) => {
        try {
            const categories = await JobCategory.find();
            res.status(200).json(categories);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
