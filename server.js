const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const server = require('http').Server(app);

const session = require('express-session');

const io = require('socket.io')(server);

server.listen(port, console.log('Server running on port: ' + port));

const db = require('./db-connection.js');

const bodyParser = require('body-parser');

//implement middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

const sessionMiddleware = session({secret: 'MIKEREADE', resave: true, saveUninitialized: true});

app.use(sessionMiddleware);

app.set('view engine', 'ejs');

Array.prototype.findObject = function(property, value) {
    for(var i = 0; i < this.length; i++) {
        if(this[i][property] === value) {
            return this[i];
        }
    }

    return null;
};

//set up socket connections
var kitchenIO = io.of('/kitchen');
kitchenIO.on("disconnect", function() {
    alert("Socket disconnected, order will not be sent via live connection");

    //TODO: try to reconnect to socket
});

kitchenIO.on('connection', (socket) => {
    console.log('Kitchen connection opened');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('newOrder', (data) => {
        io.emit('newOrder', data);
    });
});

var menusIO = io.of('/menus');
menusIO.on("disconnect", function() {
    alert("Lost connection to socket.  You will need to refresh any updates");

    //TODO: try to reconnect to socket
});

menusIO.on('connection', (socket) => {
    console.log('Menus connection opened');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


//TODO:may need wrapper to protect scope variables
//server utility functions
const sessionIsActive = s => {
    return s.active && s.active === true;
};
//ROUTING

//FOR TESTING - TO BE DELETED
app.get('/test', (req, res) => {

    res.end();
});

app.get('/', (req, res) => {
    res.render('pages/index', {pageTitle: 'Home | Uni Restaurant'})
});

//renders the waiter view for selecting menu
app.get('/waiter', (req, res) => {
    console.log('GET /waiter');
    db.Menus.find({}).then(menus => {
        res.render('pages/menu-select', {
            pageTitle: 'Menu Selection | Waiter Area',
            menus: JSON.stringify(menus)
        });
    }, error => {

        res.end();
    });
});
//renders the waiter view for taking orders
app.get('/waiter/create-order/:menuName', (req, res) => {
    console.log('GET /waiter/create-order' + req.params.menuName);
    db.Menus.findOne({name: decodeURIComponent(req.params.menuName)}).then(menu => {
        console.log(menu);
        res.render('pages/waiter-view', {
            pageTitle: 'Create Order | Waiter Area',
            menu: JSON.stringify(menu)
        });
    })
});

app.get('/kitchen', (req, res) => {
    console.log('GET /kitchen');
    db.MenuItems.find({}).then(menuItems => {
        db.OrderItems.find({completed: false}).then(itemsToComplete => {
            res.render('pages/kitchen', {
                pageTitle: 'Kitchen View | Uni Restaurant',
                allItems: JSON.stringify(menuItems),
                itemsToComplete: JSON.stringify(itemsToComplete)
            });
        });
    });
});

app.get('/counter', (req, res) => {
    console.log('GET /counter');
    res.render('pages/counter', {
        pageTitle: 'Counter View | Uni Restaurant'
    });
});

app.get('/counter/bills', (req, res) => {
    console.log('GET /bills');
    db.MenuItems.find({}).then(menuItems => {
        db.Orders.find({paid: false}).then(orders => {
            console.log(orders);
            res.render('pages/bills', {
                pageTitle: 'Bills | Counter Area',
                orders: orders,
                menuItems: menuItems
            });
        },failed => {
            res.status(500).send({err: failed});
        });
    });

});

app.get('/counter/bills/:orderId', (req, res) => {
    console.log('GET /bills');
    db.MenuItems.find({}).then(menuItems => {
        db.Orders.find({order_id: req.params.orderId}).then(order => {
            console.log(order);
            res.render('pages/print-bill', {
                pageTitle: 'Print Bill ' + req.params.orderId + ' | Counter Area',
                order: order,
                menuItems: menuItems
            });
        },failed => {
            res.status(500).send({err: failed});
        });
    });

});

app.get('/counter/reports', (req, res) => {
    console.log('GET /reports');
    db.MenuItems.find({}).then(menuItems => {
        db.Orders.find({paid: true}).then(orders => {
            console.log(orders);
            res.render('pages/reports', {
                pageTitle: 'Reports | Counter Area',
                orders: orders,
                menuItems: menuItems
            });
        },failed => {
            res.status(500).send({err: failed});
        });
    });

});

//endpoints for DB interactions
app.get('/menus', (req, res) => {
    db.Menus.find({}).then(menus => {
        db.MenuItems.find({}).then(menuItems => {
            res.send(JSON.stringify(menus));
        }, itemsFailed => {
            res.status(500).send({err: failed});
        });

    },failed => {
        res.status(500).send({err: failed});
    });
});

//get new, valid order number
const newOrderNumber = (cb) => {
    db.Orders.find({}).sort({order_id: -1}).limit(1).then(result => {
        if(result.length === 0) {
            cb(1);
        } else {
            cb(+result[0].order_id + 1);
        }
    });

};

//create new order
app.post('/orders', (req, res) => {
    //look for relevant order information
    const orderItems = req.body.items;
    //newOrderNumber();
    const orderNumber = newOrderNumber(num => {
        db.Orders.create({
            order_id: num,
            order_items: orderItems
        }).then(success => {
            res.end();
        }, error => {
            res.end();
        });
    });
});

app.get('/orders', (req, res) => {
    db.Orders.find({}).then(result => {
        res.end(JSON.stringify(result));

    }, failed => {
        res.status(500).send({err: failed});
    })
});

app.post('/orders/create', (req, res) => {
    console.log('New Order Received');
    //const tableNumber = req.body.table_number;
    console.log(req.body.length);
    let updates = [];
    for(let i = 0; i < req.body.length; i++) {
        var qty = req.body[i].quantity;
        console.log("Quantity");
        console.log(qty);
        for(let j = 0; j < qty; j++) {
            req.body[i].quantity = 1;
            console.log(req.body[i]);
            let update = db.OrderItems.create(req.body[i]);
            updates.push(update);
        }
    }

    Promise.all(updates).then(orderItems => {
        console.log(orderItems);
        db.Orders.find({}).sort({order_id: -1}).limit(1).then(order => {
            const orderId = order.length > 0 ? order[0].order_id + 1 : 1;
            db.Orders.create({order_id: orderId, order_items: orderItems}).then(newOrder => {
                kitchenIO.emit("newOrder", newOrder);
                console.log(newOrder);
            });
        })
    });

    res.end();
    /*
    db.Orders.create(req.body).then(order => {
        res.send('Order created');

    }, failed => {
        res.status(500).send({err: failed});
    });
    */
});

app.put('/orders/items/complete/:idString', (req, res) => {
    db.OrderItems.findOneAndUpdate({_id: db.ObjectId(req.params.idString)}, {completed: true}).then(updated => {
        console.log(updated);
        return res.status(200).send("Marked as complete");
    });
});
app.put('/orders/update/paid/:idString', (req, res) => {
    db.Orders.findOneAndUpdate({_id: db.ObjectId(req.params.idString)}, {paid: true}).then(updated => {
        console.log(updated);
        return res.status(200).send("Marked as paid");
    });
});


//ADMIN
app.get('/admin/login', (req, res) => {
    console.log('GET /admin/login');

    if(sessionIsActive(req.session)) {
        res.redirect('/admin');
    } else {
        res.render('pages/admin/login', {pageTitle: 'Admin Login'});
    }

});

//checks if user is logged in
app.use('/admin', (req, res, next) => {
    console.log('Check user is logged in');
    console.log(req.body);
    if(req.body.username && req.body.password) {
        //validate username and password
        if(true) {
            req.session.active = true;
            next();
        } else {
            req.session.active = false;
            res.redirect('/admin/login');
        }
    } else if(!sessionIsActive(req.session)) {
        //redirect to login page if not logged in
        res.redirect('/admin/login');
    } else {
        next();
    }
});

//receive log in credentials
app.post('/admin', (req, res) => {
    console.log('received POST /admin');

    //TODO: validate user and password here
    res.redirect('/admin');
});

app.get('/admin', (req, res) => {
    console.log('GET /admin');
    res.render('pages/admin/home', {
        pageTitle: 'Home | Admin Area'
    });
});

app.get('/admin/menus', (req, res) => {
    console.log('GET /admin/menus');
    db.Menus.find({}).then(menus => {
        res.render('pages/admin/menus2', {
            pageTitle: 'Menu Options | Admin Area',
            menus: JSON.stringify(menus)
        });
    },failed => {
        res.status(500).send({err: failed});
    });
});

app.get('/admin/users', (req, res) => {
    console.log('GET /admin/users');
    db.Users.find({}).then(users => {
        console.log(users);
        res.render('pages/admin/users', {
            pageTitle: 'Users | Admin Area',
            users: users
        });
    },failed => {
        res.status(500).send({err: failed});
    });
});

//ADMIN API
//menus
app.post('/admin/api/menus', (req, res) => {
    db.Menus.create(req.body).then(success => {
        menusIO.emit("newMenuAdded", success);
        res.end('New menu added');
    }, failed => {
        return res.status(500).send({error: failed});
    });
});

app.get('/admin/api/menus', (req, res) => {
    db.Menus.find({}).then(result => {
        res.end(JSON.stringify(result));
    });
});

app.put('/admin/api/menus/:id', (req, res) => {
    db.Menus.findOneAndUpdate({menu_id: req.params.id}, req.body, {upsert: true}, function(err, doc) {
        if (err) return res.status(500).send({error: err});

        res.end('Successfully saved.');
    });
});

app.delete('/admin/api/menus/:id', (req, res) => {
    db.Menus.remove({menu_id: req.params.id}).then(deleted => {
        menusIO.emit("menuDeleted", {id: req.params.id});
        res.end('Successfully deleted');
    }, err => {
        return res.status(500).send({err: err});
    });
});

//menu items
app.post('/admin/api/menu-items', (req, res) => {
    const menuId = req.body.menu_id;
    db.MenuItems.create(req.body).then(menuItem => {
        res.send('Menu item created');
        db.Menus.update({
            menu_id: menuId
        },{
            $push: {items: menuItem}
        }).then(menuUpdated => {
            let socketData = menuItem.toJSON();
            socketData.menu_id = menuId;
            menusIO.emit("newMenuItemAdded", socketData);
            res.end('Menu Updated');
        }, updateFailed => {
            res.status(500).send({err: updateFailed});
        });
    }, failed => {
        res.status(500).send({err: failed});
    });
});

app.get('/admin/api/menu-items', (req, res) => {
    db.MenuItems.find({}).then(result => {
        res.end(JSON.stringify(result));
    }, error => {
        res.status(500).send({err: error});
    });
});

app.get('/admin/api/menu-items/:id', (req, res) => {
    db.MenuItems.find({item_id: req.params.id}).then(result => {
        res.end(JSON.stringify(result));
    }, error => {
        res.status(500).send({err: error});
    });
});

app.put('/admin/api/menu-items/:id', (req, res) => {
    db.MenuItems.findOneAndUpdate({item_id: req.params.id}, req.body, {upsert: true}, function(err, doc) {
        if (err) return res.status(500).send({error: err});

        res.end('Successfully saved.');
    });
});

app.delete('/admin/api/menu-items/:id', (req, res) => {
    db.MenuItems.findOne({item_id: req.params.id}).then(menuItem => {
        db.Menus.findOneAndUpdate({items: {$in: menuItem}}, {$pull: {"items": {_id: menuItem._id}}}).then(() => {
            db.MenuItems.remove({_id: menuItem._id}).then(() => {
                menusIO.emit("itemDeleted", {id: req.params.id});
                res.end('Removed ' + menuItem.item_id);
            });
        });
    });
});

app.post('/admin/api/users', (req, res) => {
    db.Users.create(req.body).then(user => {
        //menusIO.emit("newMenuAdded", user);
        res.end('New user added');
    }, failed => {
        return res.status(500).send({error: failed});
    });
});
