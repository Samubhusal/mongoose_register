const express = require("express");
const app = express();
const User = require("./userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "mySuperSecretKey";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ================= MIDDLEWARE TO VERIFY JWT ================= */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* ================= SIGNUP PAGE ================= */
app.get("/signup", (req, res) => {
  res.send(`
    <h2>Signup</h2>
    <form id="signupForm">
      <input type="text" name="firstName" placeholder="First Name" required /><br/><br/>
      <input type="text" name="lastName" placeholder="Last Name" required /><br/><br/>
      <input type="text" name="address" placeholder="Address" required /><br/><br/>
      <input type="email" name="email" placeholder="Email" required /><br/><br/>
      <input type="password" name="password" placeholder="Password" required /><br/><br/>
      <button type="submit">Signup</button>
    </form>

    <script>
      // If already logged in, redirect to home
      if (localStorage.getItem("token")) {
        window.location.href = "/home";
      }

      const form = document.getElementById("signupForm");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = {
          firstName: form.firstName.value,
          lastName: form.lastName.value,
          address: form.address.value,
          email: form.email.value,
          password: form.password.value
        };
        const res = await fetch("/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          alert("Signup successful! Please login.");
          window.location.href = "/login";
        } else {
          alert(data.message || "Signup failed");
        }
      });
    </script>
  `);
});

/* ================= SIGNUP SAVE ================= */
app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({ ...req.body, password: hashedPassword });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Signup error" });
  }
});

/* ================= LOGIN PAGE ================= */
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form id="loginForm">
      <input type="email" name="email" placeholder="Email" required /><br/><br/>
      <input type="password" name="password" placeholder="Password" required /><br/><br/>
      <button type="submit">Login</button>
    </form>

    <script>
      // If already logged in, redirect to home
      if (localStorage.getItem("token")) {
        window.location.href = "/home";
      }

      const form = document.getElementById("loginForm");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = form.email.value;
        const password = form.password.value;
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/home";
        } else {
          alert(data.message || "Login failed");
        }
      });
    </script>
  `);
});

/* ================= LOGIN CHECK ================= */
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: "Invalid credentials" });
  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.json({ message: "Invalid credentials" });
  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

/* ================= HOME PAGE ================= */
app.get("/home", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Home - Node JS Training</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f0f8ff; text-align: center; padding: 50px; }
        h1 { color: #0a3d91; }
        h2 { color: #0b5ed7; }
        p { font-size: 18px; color: #333; }
        button { padding: 10px 20px; font-size: 16px; margin-top: 20px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Welcome to Node JS Training Class</h1>
      <h2>JSON Web Token (JWT) Example</h2>
      <p id="userEmail"></p>
      <button id="logout">Logout</button>

      <script>
        const token = localStorage.getItem("token");

        // If no token, redirect to signup
        if (!token) {
          window.location.href = "/signup";
        } else {
          // Verify token with server
          fetch("/verify-token", {
            headers: { "Authorization": "Bearer " + token }
          })
          .then(res => {
            if (!res.ok) throw new Error("Invalid or expired token");
            return res.json();
          })
          .then(data => {
            document.getElementById("userEmail").innerText = "Logged in as: " + data.email;
          })
          .catch(err => {
            localStorage.removeItem("token");
            window.location.href = "/signup";
          });
        }

        document.getElementById("logout").addEventListener("click", () => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        });
      </script>
    </body>
    </html>
  `);
});

/* ================= VERIFY TOKEN ROUTE ================= */
app.get("/verify-token", verifyToken, (req, res) => {
  res.json({ email: req.user.email });
});

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000/signup");
});