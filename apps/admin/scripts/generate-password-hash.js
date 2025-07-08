const bcrypt = require("bcryptjs")

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  console.log(`Password: ${password}`)
  console.log(`Hash: ${hash}`)

  // Test the hash
  const isValid = await bcrypt.compare(password, hash)
  console.log(`Hash is valid: ${isValid}`)
}

// Generovat hash pro heslo "admin123"
generateHash("admin123")
