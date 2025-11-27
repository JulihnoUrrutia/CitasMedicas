const bcrypt = require("bcryptjs");

async function run() {
  const password = "Admin123$";
  const hash = await bcrypt.hash(password, 10);
  console.log("\n======================================");
  console.log("🔐 HASH GENERADO PARA Admin123$:\n");
  console.log(hash);
  console.log("======================================\n");
}

run();
