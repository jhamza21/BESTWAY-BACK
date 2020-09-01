const router = require("express").Router();
const User = require("../models/user");
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './photos/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body._id + '.' + file.mimetype.replace('image/', ''))
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png")
    cb(null, true)
  else
    cb(null, false);
}
const upload = multer({ storage: storage, limits: { fieldSize: 1024 * 2024 * 5 }, fileFilter: fileFilter })
const { userValidation } = require("../validation/userValidation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken");

//REGISTER NEW USER
router.post("/register", async (req, res) => {
  //VALIDATE USER DATA
  const { error } = userValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  //CHECK IF USER EXIST
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json({ error: "Email already used" });

  //CHECK PASSWORD VERIFICATION
  if (req.body.password != req.body.passwordCheck)
    return res.status(400).json({ error: "Invalid password check" });

  //HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //CREATE NEW USER
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//LOGIN USER
router.post("/login", async (req, res) => {
  //VALIDATE USER DATA
  const { error } = userValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  //CHECK IF USER EMAIL EXIST
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: "Email is invalid" });
  //CHECK PASSWORD
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "Password is invalid" });

  //CREATE AND SEND TOKEN
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.json({
    token,
    user
  });
});

//UPDATE USER
router.put("/update", upload.single('image'), verifyToken, async (req, res) => {
  delete req.body._id;

  //VALIDATE USER DATA
  const { error } = userValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  //CHECK IF OLD USER EXIST
  const user = await User.findById(req.user);
  if (!user) return res.status(400).json({ error: "User not found" });
  //CHECK IF PASSWORD IS VALID
  const validOldPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validOldPassword)
    return res.status(400).json({ error: "Password is invalid" });
  //CHECK IF NEW EMAIL IS  USED
  if (req.body.email !== user.email) {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).json({ error: "Email already used by another user" });
  }
  //CHECK PASSWORD CONFIRMATION
  if (req.body.newPassword && (req.body.newPassword != req.body.passwordCheck))
    return res.status(400).json({ error: "Check your new password !" });
  //HASH PASSWORD
  if (req.body.newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
    user.password = hashedPassword;
  }
  //UPDATE USER DATA
  user.email = req.body.email;
  user.name = req.body.name;
  if (req.file) user.image = req.file.path;
  try {
    const savedUser = await user.save();
    res.json({
      _id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      image: savedUser.image
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET USER
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(
    req.user
  );
  res.json(user);
});


//DELETE USER
router.delete("/", verifyToken, async (req, res) => {
  try {
    const deltedUser = await User.findByIdAndDelete(req.user);
    res.json(deltedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//CHECK VALID TOKEN
router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    if (!verified) return res.json(false);
    const user = User.findById(verified._id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


module.exports = router;

