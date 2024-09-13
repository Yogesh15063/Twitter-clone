import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateTokenAndCookies } from "../lib/utils/genrateToken.js";
export const signup=async(req,res)=>{
  try {
    const {username, fullname,email,password}=req.body;
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({error:"Invalid email format"})
    }
     const existingUser = await User.findOne({username});
     if(existingUser){
        return res.status(400).json({error:"Username not available"})
     }

     const existingEmail= await User.findOne({email});
     if(existingEmail){
        return res.status(400).json({error:"Email already exists"})
     }
      
     if(password.length<6){
        return res.status(400).json({error:"Password is too short"})
     }


     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password,salt);

     const newUser = new User({
        fullname,
        username,
        email,
        password:hashedPassword,
        
     })
     if(newUser){
        generateTokenAndCookies(newUser._id,res)
        await newUser.save();
        res.status(201).json({
            _id:newUser._id,
            fullname:newUser.fullname,
            username:newUser.username,
            email:newUser.email,
            followers:newUser.followers,
            following:newUser.following,
            profileImg:newUser.profileImg,
            coverImg:newUser.coverImg,
        })
      
        }
        else{
            res.status(400).json({error:"Inavlid user data"})
     }
  } catch (error) {
    console.log("error in signup controller", error.message)
    res.status(500).json({error:"Internal Server Error"})
  }
}


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username is provided
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Find the user by username
        const user = await User.findOne({ username });
        
        // If user is not found, return an error immediately
        if (!user) {
            return res.status(400).json({ error: "Invalid username and password" });
        }

        // Compare the provided password with the user's stored password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        // If the password is incorrect, return an error
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username and password" });
        }

        // Generate a token and set cookies if login is successful
        generateTokenAndCookies(user._id, res);

        // Respond with user information
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });

    } catch (error) {
        console.log("Error in login controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export const logout=async(req,res)=>{
   try {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logged out successfully"})
   } catch (error) {
    console.log("error in logout controller", error.message)
    res.status(500).json({error:"Internal Server Error"})
   }
}

export const getMe = async(req,res)=>{
    try {
        const user = await User.findOne(req.user._id).select("-password");
        res.status(200).json(user)
    } catch (error) {
        console.log("error in getMe controller", error.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}