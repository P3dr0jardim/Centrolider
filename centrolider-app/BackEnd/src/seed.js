require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("./models/User");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // const exists = await User.findOne({ username: "admin" });
  // if (exists) {
  //   console.log("Admin user already exists");
  //   process.exit(0);
  // }

  await User.create({
    username: "judite",
    password: "1234",
    role: "admin",
    name: "Judite",
    email: "judite@centrolider.pt",
  });

  console.log("Admin user created — username: admin, password: admin123");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
