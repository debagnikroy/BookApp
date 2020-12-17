const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const bookSchema = new mongoose.Schema(
    {
        listedBooks:{
            userId: {
                type: String,
                trim: true,
                required: true,
                maxlength: 32
            },
            isbn: {
                type: String,
                trim: true,
                required: true,
                maxlength: 32
            }
        },
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        isbn: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000
        },
        price: {
            type: Number,
            trim: true,
            required: true,
            maxlength: 32
        },
        category: {
            type: String,            
            required: true
        },
        quantity: {
            type: Number
        },        
        photo: {
            data: Buffer,
            contentType: String
        }        
    },
    { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
