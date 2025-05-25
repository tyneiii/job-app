const Job = require('../models/Jobs');

module.exports = {
    createJob: async (req, res) => {
        try {
            const { title, location, description, salary, companyId, categoryId } = req.body;
            if (!title || !location || !description || !salary || !companyId || !categoryId) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const newJob = new Job(req.body);
            const savedJob = await newJob.save();
            const { __v, createdAt, updatedAt, ...newJobInfo } = savedJob._doc;

            res.status(201).json(newJobInfo);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateJob: async (req, res) => {
        try {
            const updatedJob = await Job.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );

            if (!updatedJob) {
                return res.status(404).json({ message: "Job not found" });
            }

            const { __v, createdAt, updatedAt, ...updatedJobInfo } = updatedJob._doc;
            res.status(200).json(updatedJobInfo);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteJob: async (req, res) => {
        try {
            const deletedJob = await Job.findByIdAndDelete(req.params.id);
            if (!deletedJob) {
                return res.status(404).json({ message: "Job not found" });
            }

            res.status(200).json({ message: "Job deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getJob: async (req, res) => {
        try {
            const job = await Job.findById(req.params.id)
                .populate('categoryId', 'title')
                .populate('companyId', 'userId company');

            if (!job) {
                return res.status(404).json({ message: "Job not found" });
            }

            res.status(200).json(job);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllJobs: async (req, res) => {
        try {
            const recent = req.query.new;
            const jobs = recent
                ? await Job.find().sort({ createdAt: -1 }).limit(2)
                : await Job.find();

            res.status(200).json(jobs);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    searchJobs: async (req, res) => {
        const searchQuery = req.query.search;
        try {
            const results = await Job.aggregate([
                {
                    $search: {
                        index: "jobsearch",
                        text: {
                            query: req.params.key,
                            path: {
                                wildcard: "*"
                            }
                        }
                    }
                }
            ])
            res.status(200).json(results);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getJobsByCategory: async (req, res) => {
        try {
            const categoryId = req.params.categoryId;

            const jobs = await Job.find({ categoryId }).populate('categoryId', 'title');

            if (jobs.length === 0) {
                return res.status(404).json({ message: "No jobs found for this category" });
            }

            res.status(200).json(jobs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCompanyJobs: async (req, res) => {
        try {
            const companyJobs = await Job.find({ companyId: req.params.uid })
                .populate('companyId', 'userId company')
                .sort({ createdAt: -1 });

            res.status(200).json(companyJobs);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
