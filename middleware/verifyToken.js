const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SEC, async (err, user) => {
            if(err){
                return res.status(401).json({message:"Token is invalid: "});
            }

            req.user = user;

            next();
        })
    }
};

const verifyAndAuth = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id || req.user.isAdmin) {
            next();
        } else{
            res.status(403).json({message : "You are not authourized to access"});
        }
    });
}

const verifyCompany = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isCompany || req.user.isAdmin) {
            next();
        } else{
            res.status(403).json({message : "You are not authourized to access"});
        }
    });
}

// const verifyAndAuthorization = (req, res, next) => {
//     verifyToken(req, res, () => {
//         if (req.user.id === req.params.id) {
//             next();
//         } else{
//             res.status(403).json("You are retricted from performing this operation!");
//         }
//     });
// }

// const verifyAndAdmin = (req, res, next) => {
//     verifyToken(req, res, () => {
//         if (req.user.isAdmin) {
//             next();
//         } else{
//             res.status(403).json("You are retricted from performing this operation!");
//         }
//     });
// }

module.exports = {verifyToken, verifyAndAuth, verifyCompany};