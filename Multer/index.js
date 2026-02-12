const express = require("express");
const app = express();
const User = require("./userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");//manage the data,file handling and uploading
const path = require("path");

const JWT_SECRET = "mySuperSecretKey";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ================= STATIC FOLDER ================= */
app.use("/uploads", express.static("uploads"));

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
    <form action="/signup" method="POST" enctype="multipart/form-data">
      <input type="text" name="firstName" placeholder="First Name" required /><br/><br/>
      <input type="text" name="lastName" placeholder="Last Name" required /><br/><br/>
      <input type="text" name="address" placeholder="Address" required /><br/><br/>
      <input type="email" name="email" placeholder="Email" required /><br/><br/>
      <input type="password" name="password" placeholder="Password" required /><br/><br/>
      <input type="file" name="photo" required /><br/><br/>
      <button type="submit">Signup</button>
    </form>

    <script>
      if (localStorage.getItem("token")) {
        window.location.href = "/home";
      }
    </script>
  `);
});

/* ================= SIGNUP SAVE (WITH PHOTO) ================= */
app.post("/signup", upload.single("photo"), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      email: req.body.email,
      password: hashedPassword,
      photo: req.file.path, // 👈 FILE PATH DB MA
    });

    res.send("Signup successful! <a href='/login'>Login</a>");
  } catch (err) {
    console.error(err);
    res.send("Signup error");
  }
});

/* ================= LOGIN PAGE ================= */
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form id="loginForm">
      <input type="email" id="email" placeholder="Email" required /><br/><br/>
      <input type="password" id="password" placeholder="Password" required /><br/><br/>
      <button type="submit">Login</button>
    </form>

    <script>
      if (localStorage.getItem("token")) {
        window.location.href = "/home";
      }

      document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

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
          alert("Login failed");
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
    <h1>Welcome to Home</h1>
    <p id="userEmail"></p>
    <img id="userPhoto" width="150"/><br/><br/>
    <button onclick="logout()">Logout</button>

    <script>
      const token = localStorage.getItem("token");
      if (!token) window.location.href = "/login";

      fetch("/verify-token", {
        headers: { "Authorization": "Bearer " + token }
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById("userEmail").innerText = data.email;
        document.getElementById("userPhoto").src = "/" + data.photo;
      });

      function logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    </script>
  `);
});

/* ================= VERIFY TOKEN ================= */
app.get("/verify-token", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({
    email: user.email,
    photo: user.photo,
  });
});

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000/signup");
});