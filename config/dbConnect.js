const { default: mongoose } = require("mongoose")

const dbConnect = () =>{
    try {
        const conn = mongoose.connect(process.env.MONGO_URL)
        console.log("Database connected")
    } catch (error) {
        console.log(`Failed to connect ${error}`)
    }
}

module.exports = dbConnect