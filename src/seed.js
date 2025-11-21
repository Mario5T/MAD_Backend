import "./db/db.config.js";
import mongoose from "mongoose";
import User from "./models/User.js";
import UserSession from "./models/UserSession.js";
import Feedback from "./models/Feedback.js";
import MenuDay from "./models/MenuDay.js";
import MenuItem from "./models/MenuItem.js";
import Shuttle from "./models/Shuttle.js";

async function run() {
  try {
    console.log("Seeding database...\n");
    await Promise.all([
      User.deleteMany({}),
      UserSession.deleteMany({}),
      Feedback.deleteMany({}),
      MenuItem.deleteMany({}),
      MenuDay.deleteMany({}),
      Shuttle.deleteMany({}),
    ]);

    const [student, driver, admin] = await User.create([
      { name: "Alice Student", email: "alice@adypu.edu.in", password: "$2a$10$r12m8Cz/8wX2kHcH6wqJdeyU3ZCqjU3p2m8s4tq4kV8p0G3I7d0m2", role: "student" },
      { name: "Bob Driver", email: "bob.driver@example.com", phone: "9999912345", password: "$2a$10$r12m8Cz/8wX2kHcH6wqJdeyU3ZCqjU3p2m8s4tq4kV8p0G3I7d0m2", role: "driver" },
      { name: "Carol Admin", email: "carol.admin@example.com", password: "$2a$10$r12m8Cz/8wX2kHcH6wqJdeyU3ZCqjU3p2m8s4tq4kV8p0G3I7d0m2", role: "admin" },
    ]);

    console.log("Users:", student._id.toString(), driver._id.toString(), admin._id.toString());
    const fb = await Feedback.create({ userName: student.name, rating: 5, comment: "Great food today!" });
    console.log("Feedback:", fb._id.toString());

    const day = await MenuDay.create({ date: new Date(), mealType: "Monday" });
    const items = await MenuItem.create([
      { name: "BREAKFAST - VEG: Poha", menuDayId: day._id },
      { name: "LUNCH - VEG: Paneer Butter Masala", menuDayId: day._id },
    ]);
    console.log("MenuDay:", day._id.toString(), "Items:", items.map(i => i._id.toString()));
    const shuttle = await Shuttle.create({
      route: "Campus Loop",
      time: new Date(Date.now() + 60 * 60 * 1000),
      location: "Main Gate",
      contact: "9999912345",
      lat: 18.5204,
      lng: 73.8567,
    });
    console.log("Shuttle:", shuttle._id.toString());

    console.log("\nSeed completed successfully.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
