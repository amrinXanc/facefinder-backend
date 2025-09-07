const ensureAuthenticated = require('../Middlewares/Auth')
const router = require('express').Router();


router.get('/' , ensureAuthenticated, (req, res) =>{
    res.status(200).json([
        {
            name : "mobile",
            price : 20000
        },
        {
            name : "tv",
            price : 50000
        }
    ])
})
module.exports = router