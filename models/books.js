const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const bookSchema = new mongoose.Schema(
    {
        listedBooks:{
            type: Array,
            default: []
        },
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        } 
    }       
);

module.exports = mongoose.model("Book", bookSchema);
