const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysqlConnection = require("./util/databaseConnection");
const productController = require("./controllers/productController");
const orderController = require("./controllers/orderController");
const authController = require("./controllers/authController");

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',  // React
        'http://localhost:3001',  // Current allowed origin
        'http://localhost:8080',  // Vue
        'http://localhost:4200'   // Angular
      ];
      
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next();
});

const connectWithRetry = async () => {
  try {
    await mysqlConnection.connect();
    console.log("Connected to MySQL database");

    await mysqlConnection.createDatabase();
    console.log("Database created/verified");

    await mysqlConnection.useDatabase();
    await mysqlConnection.createTables();
    console.log("Tables created/verified");

    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    console.log("Retrying in 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectWithRetry();
  }
};

// Routes
app.use("/api/products", productController);
app.use("/api/orders", orderController);
app.use("/api/user", authController);

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Unicart Backend Routes API",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      orders: "/api/orders",
      auth: "/api/user",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  const errorResponse = {
    error: err.message || "Internal Server Error",
    status: err.status || 500,
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(errorResponse.status).json(errorResponse);
});

connectWithRetry()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  mysqlConnection
    .end()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error during shutdown:", err);
      process.exit(1);
    });
});
