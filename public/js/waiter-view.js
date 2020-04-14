_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};
/**
 * waiter-view.js depends on
 * <script src="/socket.io/socket.io.js"></script>
 * to be loaded on the page prior to this script
 */

//open socket connection to enable sending orders via live connection
var kitchenIO = io('/kitchen');
kitchenIO.on("disconnect", function() {
    alert("Socket disconnected, order will not be sent via live connection");

    //TODO: try to reconnect to socket
});

var menu = {
    "1.1": {
        "name": "First menu item",
        "price": "10.00"
    },
    "1.2": {
        "name": "Second menu item",
        "price": "20.00"
    },
    "1.3": {
        "name": "Third menu item",
        "price": "30.00"
    }
};

//app namespace
var app = {};

(function() {
    app.OrderItem = Backbone.Model.extend({
        urlRoot: "/api/OrderItems",
        defaults: {
            id: 0,
            qty: "",
            name: "",
            price: "0.00"
        }
    });

    app.OrderList = Backbone.Collection.extend({
        model: app.OrderItem,
        url: "/api/OrderItems",
        add: function(itemView) {
            //call Collection.add
            Backbone.Collection.prototype.add.call(this, itemView.model);
            $("#orderItems").append(itemView.render().el);
            this.sync("update", this);
        }
    });

    app.orderList = new app.OrderList();

    app.OrderItemView = Backbone.View.extend({
        initialize: function(model) {
            this.model.on("change", this.render, this);
            this.model.on("destroy", this.remove, this);
        },
        tagName: "li",
        template: _.template($("#orderItemTemplate").html()),
        render: function() {
            console.log(this.model);
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });


    app.ApplicationView = Backbone.View.extend({
        el: "#waiterApp",
        initialize: function() {
            this.$newItemId = $("#itemId");
        },
        events: {
            "click #addToOrder": "addToOrder",
            "click #submitOrder": "submitOrder",
            "click #clearOrder": "clearOrder"
        },
        addToOrder: function() {
            var orderItemModel = new app.OrderItem({
                id: this.$newItemId.val(),
                qty: "1",
                name: menu[this.$newItemId.val()].name,
                price: menu[this.$newItemId.val()].price
            });

            var itemView = new app.OrderItemView({
                model: orderItemModel
            });

            app.orderList.add(itemView);
        },
        submitOrder: function() {
            /*var orderItems = $("#orderItems").find;
            console.log(app.orderList.toJSON());*/
        },
        clearOrder: function() {

        }
    });

    app.appView = new app.ApplicationView();
})();

