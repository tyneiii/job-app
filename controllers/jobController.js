const Job = require('../models/Jobs');

module.exports = {
    createJob: async(req, res) => {
        const newJob = new Job(req.body);
        try {
            const savedJob = await newJob.save();
            const { __v, createdAt, updatedAt, ...newJobInfo } = savedJob._doc;
            res.status(200).json(newJobInfo);
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
                { new: true });
            const { __v, createdAt, updatedAt, ...updatedJobInfo } = updatedJob._doc;
            res.status(200).json(updatedJobInfo);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteJob: async (req, res) => {
        const jobId = req.params.id;
        try {
            const deletedJob = await Job.findByIdAndDelete(jobId);
            if (!deletedJob) {
                return res.status(404).json({status: false, message: "Job not found" });
            }

            res.status(200).json({ status: true, message: "Job deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getJob: async (req, res) => {
        try {
            const job = await Job.findById(req.params.id);
            if (!job) {
                return res.status(404).json({status: false, message: "Job not found" });
            }

            res.status(200).json(job);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllJobs: async (req, res) => {
        const recent = req.query.new;
        try {
            let jobs;
            
            if(recent){
                jobs = await Job.find({}, {createdAt: 0, updatedAt: 0, __V: 0}).sort({createdAt: -1}).limit(2);
            } else{
                jobs = await Job.find({}, {createdAt: 0, updatedAt: 0, __V: 0});
            }
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

    getCompanyJobs: async (req, res) => {
        const uid = req.params.uid;
        try {
            const companyJobs = await Job.find({companyId: uid}, {createdAt: 0, updatedAt: 0, __V: 0}).sort({createdAt: -1});

            res.status(200).json(companyJobs);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}