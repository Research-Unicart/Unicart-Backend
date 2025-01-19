const express = require('express');
const bodyParser = require('body-parser');
const mysqlConnection = require('./util/databaseConnection');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');

const app = express();
const port = 3000;

app.use(bodyParser.json()); 

mysqlConnection.connect()
  .then(message => {
    console.log(message);
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); 
  });

mysqlConnection.createDatabase()
  .then(message => {
    console.log(message);
    mysqlConnection.useDatabase();
    mysqlConnection.createTables();
  })
  .catch(err => {
    console.error('Error creating database:', err);
  });

// Routes
app.use('/api/products', productController); 
app.use('/api/orders', orderController);   

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js MySQL API!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message });
});

