const fetch=require('node-fetch');
const User = require('../models/user');
const Book = require('../models/books');

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

//to store owner id in req
exports.addOwnerId = (req, res, next, o_id) => {
    req.o_id = o_id;
    next();
};


//get profile
exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};


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


//return list of possessed books
exports.getCurrentReadingBooks = (req, res) => {
    User.find({ _id: req.profile._id },{currentBooks:1,_id:0})
        .sort('-created')
        .exec((err, orders) => {
            console.log("orders",orders);
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
            let idx=user.currentBooks.indexOf(req.isbn);
            user.listedBooks.push(req.isbn);
            user.currentBooks.splice(idx,1);

            Book.findOne({ name: 'admin' }, (err, market) => {
                if (err || !market) {
                    return res.status(400).json({
                        error: 'Cannot be added to global transfer list'
                    });
                }
                let id=req.profile._id+"";
                let newBook={userId:id,isbn:req.isbn};
                market.listedBooks.push(newBook);

                market.save((err, updatedMarket) => {
                    if (err) {
                        console.log('MARKET UPDATE ERROR', err);
                        return res.status(400).json({
                            error: 'MARKET update failed'
                        });
                    }                    
                });
            });            
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
            user.currentBooks.push(req.isbn)
            Book.findOne({ name: 'admin' }, (err, market) => {
                if (err || !market) {
                    return res.status(400).json({
                        error: 'Failed to update transfer market'
                    });
                }
                
                let newBook={userId:req.profile._id,isbn:req.isbn};
                let idx2=-1;
                
                let id=(req.profile._id+"");
                for (const [index, x] of market.listedBooks.entries()) {                    
                    if (x.userId ==id && x.isbn == req.isbn) {
                        idx2=index;
                        break;
                    }
                }
                console.log("index in global transfer market array=",idx2);
                
                if(idx2!==-1){
                    market.listedBooks.splice(idx2,1);
                }

                market.save((err, updatedMarket) => {
                    if (err) {
                        console.log('MARKET UPDATE ERROR', err);
                        return res.status(400).json({
                            error: 'MARKET update failed'
                        });
                    }                    
                });
            });

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


//to delete a book from my possession(currentBooks)
exports.deleteBook = (req,res) => {

    User.findOne({ _id: req.profile._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        let idx=user.currentBooks.indexOf(req.isbn);
        if(idx!= -1){
            user.currentBooks.splice(idx,1);
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


//sending borrow request to owner
exports.borrowRequest = (req, res) => {

    User.findOne({ _id: req.o_id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        let isbn=req.isbn;
        let o_id_Str=req.o_id+"";   // book owner id

        // req.prifile._id - bidder id

        let idx=user.listedBooks.indexOf(req.isbn);
        
        if(idx!==-1){
            let bidderBookObj={userId:(req.profile._id+""),isbn:req.isbn};
            user.lendRequests.push(bidderBookObj);
            user.listedBooks.splice(idx,1);

            Book.findOne({ name: 'admin' }, (err, market) => {
                if (err || !market) {
                    return res.status(400).json({
                        error: 'Failed to update transfer market'
                    });
                }
                
                let idx2=-1;
                
                let id=o_id_Str;
                for (const [index, x] of market.listedBooks.entries()) {
                    if (x.userId ==id && x.isbn == req.isbn) {
                        idx2=index;
                        break;
                    }
                }
                console.log("index in global transfer market array=",idx2);
                
                if(idx2!==-1){
                    market.listedBooks.splice(idx2,1);
                }

                market.save((err, updatedMarket) => {
                    if (err) {
                        console.log('MARKET UPDATE ERROR', err);
                        return res.status(400).json({
                            error: 'MARKET update failed'
                        });
                    }                    
                });
            });
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

const removeFromConfirmBid = (o_id,b_id,isbn) => {
    User.findOne({ _id: o_id }, (err, user) => {
        if (err || !user) {
            return -1;
        }
        
        let idx2=-1;        
        let id=b_id+"";

        for (const [index, x] of user.lendRequests.entries()) {
            if (x.userId ==id && x.isbn == isbn) {
                idx2=index;
                break;
            }
        }

        if(idx2==-1)return -1;
        
        if(idx2!==-1){
            user.lendRequests.splice(idx2,1);
        }

        user.save((err, updatedUser) => {
            if (err) {
                return -1;
            }                    
        });
    });
};


exports.accept = (req,res) => {
    // req.o_id is the bidder who is the new owner now
    // req.profile._id is the old owner
    User.findOne({ _id: req.o_id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        removeFromConfirmBid(req.profile._id,req.o_id,req.isbn);
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


exports.decline = (req,res) => {
    // req.o_id is the bidder
    // req.profile._id is the old owner
    User.findOne({ _id: req.profile._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        

        let idx2=-1;        
        let id= req.o_id+"";

        for (const [index, x] of user.lendRequests.entries()) {
            if (x.userId ==id && x.isbn == req.isbn) {
                idx2=index;
                break;
            }
        }

        if(idx2==-1)return -1;
        
        if(idx2!==-1){
            user.lendRequests.splice(idx2,1);
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

