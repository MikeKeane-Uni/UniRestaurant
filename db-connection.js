const mysql = require('mysql');
const config = require('./config/dbconfig.js');

let pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
});

//insert new menu item
module.exports.insertNewMenu = (data) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;

            conn.query('INSERT INTO menus SET ?', data, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results) {
                    resolve(results);

                    conn.release();
                } else {
                    reject({message: 'Failed to insert menu'});
                }
            });
        });
    });
};

module.exports.insertNewItem = (data) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;

            conn.query('INSERT INTO items SET ?', data, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results) {
                    resolve(results);

                    conn.release();
                } else {
                    reject({message: 'Failed to insert item'});
                }
            });
        });
    });
};

//select all menus
module.exports.getMenus = (data) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;

            let sql = 'SELECT * FROM menus';

            if(data && data.name && data.name !== '') {
                sql += ' WHERE ?';
            }


            conn.query(sql, data, (err, results) => {
                if (err) {
                    console.error('Problem executing query');
                    conn.release();
                    return;
                }

                if (results) {
                    resolve(results);

                    conn.release();
                } else {
                    reject('');
                }
            });
        });
    });
};



//EXAMPLES
module.exports.selectExample = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;

            conn.query('SELECT * FROM activeSessions', (err, results) => {
                if (err) {
                    console.error('Problem executing query');
                    return;
                }

                if (results) {
                    resolve(results);

                    conn.release();
                } else {
                    reject('');
                }
            });
        });
    });
};

module.exports.insertExample = (key, username) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;

            conn.query(`INSERT INTO activeSessions (sessionKey, username) VALUES ('${key}', '${username}')`, (err, results) => {
                if (err) {
                    console.error('Problem inserting active session');
                    return;
                }

                if (results) {
                    resolve(results);

                    conn.release();
                } else {
                    reject('');
                }
            });
        });
    });
};

module.exports.deleteExample = (id, key) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;

            conn.query(`DELETE FROM activeSessions WHERE id = ${id} AND sessionKey = '${key}'`, (err, results) => {
                if (err) {
                    console.error('Problem deleting active session');
                    return;
                }

                if (results) {
                    resolve(results);

                    conn.release();
                } else {
                    reject('');
                }
            });
        });
    });
};

//quotation related queries
module.exports.insertExample = (customerDetails) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) throw err;

            conn.query(`INSERT INTO quotations (customerForename, customerSurname, customerTelephoneNumber, customerEmailAddress) 
                              VALUES ('${customerDetails.forename}', '${customerDetails.surname}', '${customerDetails.tel}', '${customerDetails.email}')`, (err, results) => {
                if (err) {
                    console.error('Problem inserting active session');
                    return;
                }

                if (results) {
                    resolve(results);

                    conn.release();
                } else {
                    reject('');
                }
            });
        });
    });
};

pool.on('error', (err) => {
    console.log(err.code);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        pool = mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        });
    }
})
