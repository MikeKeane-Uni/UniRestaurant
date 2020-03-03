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

//check for active session (i.e. user is logged in)
let sessionIsActive = sesh => {
    return (sesh.active && sesh.active === true);
};

//ROUTING
//renders the watier view for taking orders
app.get('/take-order', (req, res) => {
    res.render('pages/take-order');
});



io.on('connection', (socket) => {
    console.log('Socket connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('newOrder', (data) => {
        io.emit('newOrder', data);
    })
});

app.post('/send-order', (req, res) => {
    //TODO: need to put into database, on receiving order in database then emit event, on error return error to user
    //io.emit('newOrder', req.body);

});

app.get('/generate-bill', (req, res) => {

    res.end();
});


app.get('/active-orders', (req, res) => {
    res.render('pages/active-orders');
});

app.get('/counter', (req, res) => {
    res.render('pages/counter');
});

//ADMIN API
app.get('/admin/login', (req, res) => {
    const sesh = req.session;

    res.render('pages/admin/login', {targetUrl: sesh.targetUrl});
});


//handles login to admin pages/api
app.use('/admin', (req, res, next) => {
    const targetUrl = '/admin' + req.url;

    let sesh = req.session;
    //if user name and password sent with request then check it, otherwise directs to login page
    if(sessionIsActive(sesh)) {
        delete sesh.targetUrl;
        next();
    } else if(req.body.username && req.body.password) {

        //TODO: validate username and password
        sesh.active = true;

        res.writeHead(302, {
            Location: sesh.targetUrl
        });

        res.end();
    } else {
        sesh.targetUrl = targetUrl;

        res.writeHead(302, {
            Location: '/admin/login'
        });

        res.end();
    }
});

//ADMIN USER PAGES
app.get('/admin', (req, res) => {
    res.render('pages/admin/home');
});

//ADMIN API
//retrieves specific menu details (name, start, end)
app.get('/admin/api/menus/:name', (req, res) => {
    db.getMenus(req.params).then(result => {
        res.end(JSON.stringify(result));
    });
});

//retrieves all menu details (name, start, end)
app.get('/admin/api/menus', (req, res) => {
    db.getMenus().then(result => {
        res.end(JSON.stringify(result));
    });
});

app.post('/admin/menus/:name/:start_hour?/:end_hour?', (req, res) => {
    db.insertNewMenu(req.params).then(result => {
        res.end(JSON.stringify(result));
    }, err => {
        res.end(err.message);
    });
});
