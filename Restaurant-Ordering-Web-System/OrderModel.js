const { Double } = require("bson");
const mongoose = require("mongoose");


let orderSchema = mongoose.Schema({

	username: {
		type: String, 
		required: true,
	},

	restaurantID: {
		type: Number, 
		required: true,
	},

    restaurantName: {
		type: String, 
		required: true,
	},

    subtotal: {
		type: Number, 
		required: true
	},

    total: {
		type: Number, 
		required: true,
	},

    fee: {
		type: Number, 
		required: true
	},

    tax: {
		type: Number, 
		required: true,
	},

    order: {
		type: Object, 
		required: true
	},

    userId: {
		type: String, 
		required: true
	},
});



module.exports = mongoose.model("order", orderSchema);

