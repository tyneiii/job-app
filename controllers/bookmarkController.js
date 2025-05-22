const Bookmark = require('../models/Bookmark');
const Job = require('../models/Jobs');

module.exports = {
    createBookmark: async (req, res) => {
        const jobId = req.body.job;
        const userId = req.user.id;

        try {
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(400).json({ message: 'Job not found' });
            }
            
            const newBookmark = new Bookmark({ job: jobId, userId: userId });
            const saveBookmark = await newBookmark.save();

            res.status(200).json({status: true, bookmarkId: saveBookmark._id});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllBookmarks: async (req, res) => {
        const userId = req.user.id;
        try {
            const bookmarks = await Bookmark.find({userId: userId}, {createdAt: 0, updatedAt: 0, __V: 0})
            .populate({
                path: 'job',
                select: "-requirements -description -createdAt -updatedAt -__v"
            });
            res.status(200).json(bookmarks);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getBookmark: async (req, res) => {
        const jobId = req.params.id;
        const userId = req.user.id;

        try {
            const bookmarks = await Bookmark.findOne({userId: userId, job: jobId})
            
            if(!bookmarks) {
                return res.status(200).json(null);
            }
            res.status(200).json({status: true, bookmarkId: bookmarks._id});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteBookmark: async (req, res) => {
        const bookmarkId = req.params.id;

        try {
            await Bookmark.findByIdAndDelete(bookmarkId);
            res.status(200).json({status: true, message: "Bookmark deleted successfully"});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}