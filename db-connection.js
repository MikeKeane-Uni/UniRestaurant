const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

mongoose.connect('mongodb://localhost:27017/restaurant', {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false});


const MenuItemSchema = new Schema({
    item_id: {
        type: String
    },
    name: {
        type: String
    },
    price: {
        type: Number,
        min: 0
    }
});

const MenuSchema = new Schema({
    menu_id: {
        type: Number
    },
    name: {
        type: String,
        unique: true
    },
    items: [{
        type: MenuItemSchema,
        default: []
    }]
});


const OrderItemSchema = new Schema({
    table_number: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    item_id: {
        type: String,//must match item_id of a valid menu_item
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const OrderSchema = new Schema({
    order_id: {
        type: Number,
        required: true,
        unique: true
    },
    order_items: {
        type: [OrderItemSchema],
        default: []
    },
    paid: {
        type: Boolean,
        default: false
    }
});

const UserSchema = new Schema({
    user_id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


module.exports = {
    Menus: mongoose.model('Menu', MenuSchema),
    MenuItems: mongoose.model('MenuItem', MenuItemSchema),
    Orders: mongoose.model('Order', OrderSchema),
    OrderItems: mongoose.model('OrderItem', OrderItemSchema),
    Users: mongoose.model('Users', UserSchema),
    CompletedOrders: mongoose.model('CompletedOrder', OrderSchema),
    ObjectId: ObjectId
};
