const User = require('../models/User');
const Skills = require('../models/Skills');
const Company = require('../models/Company');
const CryptoJS = require('crypto-js');

module.exports = {
    updateUser: async (req, res) => {
        // if(req.body.password){
        //     res.bod.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString()
        // }

        try {
            await User.findByIdAndUpdate(
                req.user.id,
                { $set: req.body },
                { new: true }
            );
            // const {password, __v, createdAt, ...orthers} = updateUser._doc; 
            res.status(200).json({ status: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    updateProfileUser: async (req, res) => {
    try {
      const { username, location, phone } = req.body;

        if (req.body.email) {
            return res.status(400).json({ message: "Email is read-only and cannot be changed." });
        }

        const update = {};
        if (username !== undefined) update.username = username;
        if (location !== undefined) update.location = location;
        if (phone !== undefined) update.phone = phone;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const { password, __v, createdAt, updatedAt, ...userData } = updatedUser._doc;
        res.status(200).json(userData);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `${field} already in use.` });
        }
        res.status(500).json({ message: err.message });
    }
  },

    changePassword: async (req, res) => {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide old and new password." });
        }

        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "User not found." });

            const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET).toString(CryptoJS.enc.Utf8);

            if (decryptedPassword !== oldPassword) {
                return res.status(400).json({ message: "Old password is incorrect." });
            }

            const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword, process.env.SECRET).toString();

            user.password = encryptedNewPassword;
            await user.save();

            res.status(200).json({ status: true, message: "Change password successfully." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.user.id);
            res.status(200).json({ status: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    getUser: async (req, res) => {
        try {
            const profile = await User.findById(req.user.id);
            const { password, __v, createdAt, updatedAt, ...userData } = profile._doc;
            res.status(200).json({ ...userData });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    getAllUser: async (req, res) => {
        try {
            const allUsers = await User.find();
            res.status(200).json(allUsers);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    addSkills: async (req, res) => {
        const newSkills = new Skills({ userId: req.user.id, skill: req.body.skill });
        try {
            await newSkills.save();

            await User.findByIdAndUpdate(req.user.id, { $set: { skills: true } });

            res.status(200).json({ status: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    getSkills: async (req, res) => {
        const userId = req.user.id;
        try {
            const skills = await Skills.find({ userId: userId }, { createdAt: 0, updatedAt: 0, __V: 0 });
            if (skills.length === 0) {
                return res.status(200).json([]);
            }

            res.status(200).json(skills);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    deleteSkills: async (req, res) => {
        const id = req.params.id;

        try {
            await Skills.findByIdAndDelete(id);
            res.status(200).json({ status: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    addCompany: async (req, res) => {
        const newCompany = new Company({
            userId: req.user.id,
            uid: req.body.uid,
            company: req.body.company,
            hq_address: req.body.hq_address,
            working_hrs: req.body.working_hrs
        });
        try {
            await newCompany.save();
            await User.findByIdAndDelete(req.user.id, { $set: { company: true } });
            res.status(200).json({ status: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    updateCompany: async (req, res) => {
        const id = req.params.id;
        try {
            const updateCompany = await Company.findByIdAndUpdate(id, {
                company: req.body.company,
                hq_address: req.body.hq_address,
                working_hrs: req.body.working_hrs
            }, { new: true });

            if (!updateCompany) return res.status(400).json({ status: false, message: "Company not found" });

            res.status(200).json({ status: true });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    getCompany: async (req, res) => {
        const uid = req.params.uid;
        try {
            const companyData = await Company.find({ uid: uid }, { createdAt: 0, updatedAt: 0, __V: 0 });

            const company = companyData[0];

            res.status(200).json(company);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    },

    getCompanys: async (req, res) => {
        try {
            const companys = await User.aggregate([
                { $match: { isCompany: true } },
                { $sample: { size: 7 } },
                {
                    $project: {
                        _id: 0,
                        username: 1,
                        profile: 1,
                        uid: 1
                    }
                }
            ]);
            res.status(200).json(companys);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}