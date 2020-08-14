const {Schema, model} = require("mongoose");


const user = new Schema({
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type: String
    },
    salt:{
        type: String
    }
},{
    timestamps: true
})

module.exports = model("User", user)