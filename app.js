const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDB = require('./config/db.config');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:4000'],
    credentials: true
}));


connectDB();

app.use('/api/user', require('./routes/user.route'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/category', require('./routes/category.route'));
app.use("/api/product", require('./routes/product.route'));
app.use("/uploads", express.static("uploads"));
app.use("/api/order", require("./routes/order.route"));
app.use("/api/cart", require("./routes/cart.route"));
app.use("/api/address", require("./routes/address.route"));
app.use("/api/review", require("./routes/review.route"));
app.use("/api/report", require("./routes/report.route"));




const port = process.env.PORT;
app.listen(port, _ => console.log(`server started at port ${port}`))

