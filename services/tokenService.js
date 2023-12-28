import jwt from "jsonwebtoken";

// Secret key to sign the JWT token
const secretKey = "your-secret-key"; // Replace with a secure secret key

// Generate a JWT token for a user
const generateToken = (userId) => {
  // Payload includes user information
  const payload = {
    userId,
  };

  // Options for token creation (e.g., expiration time)
  const options = {
    expiresIn: "1h", // Token expires in 1 hour, adjust as needed
  };

  // Create and sign the JWT token
  const token = jwt.sign(payload, secretKey, options);

  return token;
};

export { generateToken };
