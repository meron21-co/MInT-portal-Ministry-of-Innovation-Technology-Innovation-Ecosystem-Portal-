// hash_admin.js
const bcrypt = require('bcryptjs'); // we use bcryptjs because it works everywhere

// The password you want for your admin
const password = "Admin123";

// Generate hash
bcrypt.genSalt(10, (err, salt) => {
  if (err) return console.error(err);
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) return console.error(err);
    console.log("Your bcrypt hash is:\n", hash);
  });
});
