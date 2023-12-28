// app.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import prisma from "./db/index.js";
import { generateToken } from "./services/tokenService.js";
import { verifyToken } from "./services/authMiddleware.js";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

app.post("/register", async (req, res) => {
  const { email, password, userRole } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userRole: userRole ? userRole : "user",
      },
    });

    console.log("User registered successfully");
    res.status(200).send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Check if email exists
app.post("/check-email", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      console.log("Email exists");
      res.status(200).send("Email exists");
    } else {
      console.log("Email not found");
      res.status(401).send("Email not found");
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        console.log("User authenticated successfully");

        // Generate a JWT token
        const token = generateToken(user.id);

        // Send the token in the response
        console.log(user);
        res
          .status(200)
          .json({ token, userRole: user.userRole, email: user.email });
      } else {
        console.log("Incorrect password");
        res.status(401).send("Incorrect password");
      }
    } else {
      console.log("User not found");
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log("User credentials updated successfully");
    res.status(200).send("User credentials updated successfully");
  } catch (error) {
    console.error("Error updating user credentials:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown to close Prisma connection when the app is terminated
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit();
});
