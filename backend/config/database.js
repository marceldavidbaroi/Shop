// const mongoose = require('mongoose');


// const connectDatabase= () =>{
//     mongoose.connect(process.env.DB_LOCAL_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }).then(con => {
//         console.log(`MongoDB Database connected with HOST: ${con.connect.host}`)
//     })
// } 




// module.exports = connectDatabase;





const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.DB_LOCAL_URI)
    .then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
    })
}

module.exports = connectDatabase;
