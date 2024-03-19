const mongoose = require("mongoose");

module.exports.connectToMongoServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to mongoDB');
  } catch (e) {
    console.log('some error occured');
  }
};
