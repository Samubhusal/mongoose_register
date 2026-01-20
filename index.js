// const express = require("express");
// const app = express();
// const User = require("./usermodel");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.send(`
//         <h2>Register</h2>
//         <form action="/create" method="POST">
//            <lable for="name">Name:</lable><br>
//             <input type="text" name="name" placeholder="Enter your name" required/>
//             <br>

//             <lable for="email">Email:</lable><br>
//             <input type="email" name="email" placeholder="Enter your email" required/>
//             <br>

//             <lable for="nickname">Nickname:</lable><br>
//             <input type="text" name="nickname" placeholder="Enter your nickname"/>
//             <br>

//             <lable for="password">Password:</lable><br>
//             <input type="Password" name="password" 
//             placeholder="Enter your password" required/><br><br>

//             <button type="Submit">Submit</button>
//         </form>
//         <br>
//         <p>Already have an account?</p>
//         // This button triggers the redirect to the /login route

//         <button onclick="" herf=""></button>
        
//         `)
// })

// app.post('/create', async (req, res) => {
//     const user = await User.create(req.body);
//     res.send("click here to login <a href='/login'>Login</a>");
// })


// app.get('/login', (req, res) => {
//     res.send(`
//         <section style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f4f4f9;">
//             <div class="box" style="background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.2); width:300px; text-align:center;">
//                 <h1 class="header" style="font-family:Arial, sans-serif; font-size:24px; color:#333; margin-bottom:20px;">Signup Form</h1>
    
//                 <form method="post" action="#" enctype="multipart/form-data" style="display:flex; flex-direction:column; gap:15px;">
      
//                     <label for="username" style="font-size:14px; font-weight:bold; text-align:left; color:#555;">Username</label>
//                     <input type="text" placeholder="Enter your name" id="username" 
//                     style="padding:10px; border:1px solid #ccc; border-radius:5px; font-size:14px;" />
      
//                     <label for="password" style="font-size:14px; font-weight:bold; text-align:left; color:#555;">Password</label>
//                     <input type="password" placeholder="Enter your password" id="password" 
//                     style="padding:10px; border:1px solid #ccc; border-radius:5px; font-size:14px;" />
      
//                     <button onclick="window.location.href='./login'" 
//                         style="padding:10px; background:#4CAF50; color:#fff; border:none; border-radius:5px; font-size:16px; cursor:pointer;">
//                         Sign In
//                     </button>
//                  </form>
//             </div>
//         </section>
//     `)
// })

//   app.post('/login', async(req, res) => {

//      res.send("Hello i am Samikshya");
//    });
// app.listen(5000, () => {
//     console.log("hello");
// })

const express = require("express");
const app = express();
const User = require("./usermodel");

app.use(express.urlencoded({ extended: true }));

/* ================= SIGNUP PAGE ================= */
app.get("/signup", (req, res) => {
  res.send(`
    <h2>Signup</h2>
    <form action="/signup" method="POST">
      <input type="text" name="firstName" placeholder="First Name" required /><br/><br/>
      <input type="text" name="lastName" placeholder="Last Name" required /><br/><br/>
      <input type="text" name="address" placeholder="Address" required /><br/><br/>
      <input type="email" name="email" placeholder="Email" required /><br/><br/>
      <input type="password" name="password" placeholder="Password" required /><br/><br/>
      <button type="submit">Signup</button>
    </form>
  `);
});

/* ================= SIGNUP SAVE ================= */
app.post("/signup", async (req, res) => {
  await User.create(req.body);
  res.redirect("/login");
});

/* ================= LOGIN PAGE ================= */
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form action="/login" method="POST">
      <input type="email" name="email" placeholder="Email" required /><br/><br/>
      <input type="password" name="password" placeholder="Password" required /><br/><br/>
      <button type="submit">Login</button>
    </form>
  `);
});

/* ================= LOGIN CHECK ================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({email,password});

  if (user) {
    res.redirect("/home");
  } else {
    res.send("❌ Invalid email or password");
  }
});

/* ================= HOME ================= */
app.get("/home", (req, res) => {
  res.send("<h1>✅ You are successfully logged in</h1>");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/signup");
});