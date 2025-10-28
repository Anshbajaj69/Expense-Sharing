import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import {generateTokenAndSetCookie} from "../webtoken/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password, mobile } = req.body;

    // Validation - All fields required
    if (!username || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      mobile,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(newUser._id, res);

    // Send success response
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        mobile: newUser.mobile
      },
    });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    return res.status(500).json({ message: "Error in creating new user" });
  }
};


export const login = async (req,res)=>{
    try{
      const {loginIdentifier, password} = req.body;

      if(!loginIdentifier || !password){
        return res.status(400).json({message: "All fields are required"});
      }

      const existingUser = await User.findOne({
        $or: [
          {username: loginIdentifier},
          {email: loginIdentifier},
          {mobile: loginIdentifier}
        ]
      });

      if(!existingUser){
        return res.status(400).json({message: "Invalid credentials"});
      }

      const isMatch = await bcrypt.compare(password, existingUser?.password || "");
      if(!isMatch){
        return res.status(400).json({message: "Invalid password"});
      }

      generateTokenAndSetCookie(existingUser._id,res);

      res.status(200).json({ message: "Login successful", user: { username: existingUser.username, email: existingUser.email } });
      
    }
    catch(error){
      console.log("Error in login controller", error.message);
      return res.status(500).json({message: "Error in logging in"});
        
    }
}

export const getUserProfile = async (req,res)=>{
    try{
       const userId = req.user._id;

      const user = await User.findById(userId).select("-password");

      if(!user){
        return res.status(404).json({message: "USER NOT FOUND"});
      }
      res.status(200).json({user});
    }
    catch(error){
      console.log("error fetching user profile", error.message);
      return res.status(500).json({message: "Error fetching user profile"})
    }
}

export const fetchFriends = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build a filter query
    const query = {
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Fetch users with pagination
    const users = await User.find(query, { _id: 1, username: 1, email: 1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ username: 1 }); // optional sort alphabetically

    // Count total users for pagination metadata
    const totalUsers = await User.countDocuments(query);

    return res.status(200).json({
      users,
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Error fetching users" });
  }
};
