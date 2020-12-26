const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { 
    getTransferMarketListedBooks
    } = require('../controllers/book');

    const { userById,
        addIsbnInReq,         
            addOwnerId   
    } = require('../controllers/user');

router.get('/secret', requireSignin, (req, res) => {
    res.json({
        user: 'got here yay'
    });
});

router.get('/getTransferMarketListedBooks/:userId', getTransferMarketListedBooks);



router.param('userId', userById);
router.param('isbn', addIsbnInReq);
router.param('ownerId', addOwnerId);

module.exports = router;
