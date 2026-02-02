const mongoose = require('mongoose');

const DB = process.env.MONGODB_URI;

const connectDB= async()=>{
    try {

        const conn = await mongoose.connect(DB);
        console.log('database connected')
    }
    catch(err){
        console.log('database connection error',err.message);
        process.exit(1);
    }
    
}

module.exports= connectDB;  