const fetch=require('node-fetch');
const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');

//to store profile in req
exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    });
};

//to store isbn in req
exports.addIsbnInReq = (req, res, next, isbn) => {
    req.isbn = isbn;
    next();
};


//get profile
exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

// exports.update = (req, res) => {
//     console.log('user update', req.body);
//     req.body.role = 0; // role will always be 0
//     User.findOneAndUpdate({ _id: req.profile._id }, { $set: req.body }, { new: true }, (err, user) => {
//         if (err) {
//             return res.status(400).json({
//                 error: 'You are not authorized to perform this action'
//             });
//         }
//         user.hashed_password = undefined;
//         user.salt = undefined;
//         res.json(user);
//     });
// };



//to update user
exports.update = (req, res) => {
    // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
    const { name, password } = req.body;

    User.findOne({ _id: req.profile._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if (!name) {
            return res.status(400).json({
                error: 'Name is required'
            });
        } else {
            user.name = name;
        }

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Password should be min 6 characters long'
                });
            } else {
                user.password = password;
            }
        }

        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'User update failed'
                });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        });
    });
};


/*exports.listCurrentReadingBooks = (req, res) => {
    User.distinct('category', {}, (err, categories) => {
        if (err) {
            return res.status(400).json({
                error: 'Categories not found'
            });
        }
        res.json(categories);
    });
};*/

//await MyModel.find({ name: /john/i }, 'name friends').exec();



//return list of possessed books
exports.getCurrentReadingBooks = (req, res) => {
    User.find({ _id: req.profile._id },{currentBooks:1,_id:0})
        .sort('-created')
        .exec((err, orders) => {
            console.log(orders);
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};

//return list of books listed by me
exports.getListedBooks = (req, res) => {
    User.find({ _id: req.profile._id },{listedBooks:1,_id:0})
        .sort('-created')
        .exec((err, orders) => {
            console.log(orders);
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};



//to list a book
exports.transferListBooks = (req, res) => {

    User.findOne({ _id: req.profile._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        
        if(user.currentBooks.indexOf(req.isbn)!==-1){
            user.listedBooks.push(req.isbn);
        }

        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'User update failed'
                });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        });
    });
};


//to bring back from listed books
exports.backFromListBook = (req, res) => {

    User.findOne({ _id: req.profile._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        let idx=user.listedBooks.indexOf(req.isbn);
        if(idx!==-1){
            user.listedBooks.splice(idx,1);
        }

        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'User update failed'
                });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        });
    });
};






/*exports.addOrderToUserHistory = (req, res, next) => {
    let history = [];

    req.body.order.products.forEach(item => {
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.count,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        });
    });

    User.findOneAndUpdate({ _id: req.profile._id }, { $push: { history: history } }, { new: true }, (error, data) => {
        if (error) {
            return res.status(400).json({
                error: 'Could not update user purchase history'
            });
        }
        next();
    });
};

exports.purchaseHistory = (req, res) => {
    Order.find({ user: req.profile._id })
        .populate('user', '_id name')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};

*/


// fetch('someurltoAJsonFile.json')
//   .then(response => response.json())
//   .then(data => {
//     console.log(data)
//   });



// extra
exports.getBookFromISBN = (req,res) => {
    let url=req.isbn;
    console.log(req.isbn,req.profile._id);
    return fetch("http://openlibrary.org/api/books?bibkeys=ISBN:"+req.isbn+"&jscmd=details&format=json", {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
           //let val=(JSON.stringify(data));
            let val=(data["ISBN:"+url]);
            //console.log(val.details.publishers);
            res.json(val);
        })
        .catch(err => {
            console.log(err);
        });
};



//to add a book in my possession(currentBooks)
exports.addISBN = (req,res) => {
    const { name, password } = req.body;

    User.findOne({ _id: req.profile._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user.currentBooks.push(req.isbn);
        
        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'User update failed'
                });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        });
    });
};

