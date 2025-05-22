const User = require('../models/User');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const admin = require('firebase-admin');

module.exports = {
    createUser: async (req, res) => {
        // const newUser = new User({
        //     username: req.body.username,
        //     email: req.body.email,
        //     password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString(),
        // });

        // try{
        //     const savedUser = await newUser.save();
        //     res.status(201).json({status: true, message: "User created successfully", user: savedUser });
        // } catch (error) {
        //     res.status(500).json({ message: error.message });
        // }

        const user = req.body;
        try {
            await admin.auth().getUserByEmail(user.email);
            return res.status(400).json({ message: "Email already exists" });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                try {
                    const userResponse = await admin.auth().createUser({
                        email: user.email,
                        password: user.password,
                        emailVerified: false,
                        disabled: false,
                    });

                    const newUser = await new User({
                        uid: userResponse.uid,
                        username: user.username,
                        email: user.email,
                        password: CryptoJS.AES.encrypt(user.password, process.env.SECRET).toString(),
                    });

                    await newUser.save();

                    res.status(201).json({ status: true, message: "User created successfully", user: newUser });
                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            }
        }
    },

    loginUser: async (req, res) => {
        // try{
        //     const user = await User.findOne({ email: req.body.email });
        //     !user && res.status(401).json({ message: "Wrong Login Details" });
            
        //     const decryptedpass = await CryptoJS.AES.decrypt(user.password, process.env.SECRET);
        //     const depassword = decryptedpass.toString(CryptoJS.enc.Utf8);

        //     depassword != req.body.password && res.status(401).json("Wrong Password");

        //     const userToken = jwt.sign(
        //         { id: user._id, isAdmin: user.isAdmin },
        //         process.env.JWT_SEC,
        //         { expiresIn: "1d" }
        //     );

        //     const { password, __v, createdAt, ...others } = user._doc;
        //     res.status(200).json({ ...others, userToken });
        // } catch (error) {
        //     res.status(500).json({ message: error.message });
        // }

        try {
            const user = await User.findOne({ email: req.body.email },
                { __v: 0, createdAt: 0, updatedAt: 0, skills: 0, email: 0, updated: 0, isCompany: 0 });          

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            } 
            
            const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET);
            const depassword = decryptedPassword.toString(CryptoJS.enc.Utf8);

            if (depassword !== req.body.password) {
                return res.status(401).json({ message: "Invalid Password" });
            }

            const userToken = jwt.sign({
                id: user._id, 
                isAdmin: user.isAdmin,
                isCompany: user.isCompany,
                uid: user.uid
            },
                process.env.JWT_SEC,
                { expiresIn: "21d" }
            );

            const { password, isAdmin, ...others } = user._doc;
            res.status(200).json(
                { ...others, userToken }
            )
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}