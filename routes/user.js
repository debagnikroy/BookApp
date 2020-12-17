const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const { userById,addIsbnInReq, read, update, getCurrentReadingBooks, addISBN,getBookFromISBN,getListedBooks,transferListBooks,backFromListBook} = require('../controllers/user');

router.get('/secret', requireSignin, (req, res) => {
    res.json({
        user: 'got here yay'
    });
});

router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);
//router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);
router.get('/user/getCurrentBooks/:userId',  getCurrentReadingBooks);
//router.get('/addISBN/:userId/:isbn', requireSignin, isAuth, getCurrentReadingBooks,addISBN);
router.get('/user/getListedBooks/:userId',  getListedBooks);

router.get('/addISBN//:isbn', getBookFromISBN);
router.get('/addISBN/:userId/:isbn', addISBN);
router.get('/user/listBook/:userId/:isbn', transferListBooks);
router.get('/user/backFromListBook/:userId/:isbn', backFromListBook);

router.param('userId', userById);
router.param('isbn', addIsbnInReq);

module.exports = router;
