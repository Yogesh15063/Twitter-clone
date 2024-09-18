import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from 'cloudinary'
import Notification from "../models/notification.model.js";

export const createPost = async (req,res)=>{
    try {
        if (!req.user._id) {
            return res.status(400).json({ message: "User ID is missing from the request." });
        }
        const {text} = req.body;
        let {img}=req.body;
        const userId = await req.user._id.toString();
        let user = await User.findById(userId);
        if(!user) return res.statsu(400).json({message:"User not found"});
        if(!text && !img){
            return res.status(400).json({error:"Post must have text or image"});
        }
        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url
        }
        const newPost = new Post({
            user:userId,
            text,
            img,
        })
       await newPost.save();
       res.status(201).json(newPost);
       

    } catch (error) {
        console.log("Error in createPost",error);
        res.status(500).json({error:error.message})
    }
}

export const deletePost = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        if(post.user.toString()!== req.user._id.toString()){
            return res.status(404).json({error:"You are not authorized to delete this post"});
        }

        if(post.img){
            const imdId=post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imdId);
        }

        await Post.findByIdAndDelete(req.params.id);

    } catch (error) {
         console.log("Error in deletepost",error);
        res.status(500).json({error:error.message})
    }
}

export const commentOnPost = async (req,res)=>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if(!text){
            return res.status(400).json({error:"Text is required"})
        }

        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({error:"Post is not found"})
        }
        const comment = {user:userId,text}
        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);

    } catch (error) {
        console.log("Error in commentOnpost",error);
        res.status(500).json({error:error.message})
    }
}

export const likeUnlikePost =async(req,res)=>{
    try {
        const userId = req.user._id;
        const{id:postId} = req.params;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({error:"Post is not found"})
        }
        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost){
          //Unlike post
          await Post.updateOne({_id:postId},{$pull: {likes:userId}});
          await User.updateOne({_id:userId},{$pull: {likedPosts:postId}});
          const updatedLikes = post.likes.filter((id)=>id.toString()!==userId.toString())
          res.status(200).json(updatedLikes)
        }
        else{
            post.likes.push(userId);
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}})
            await post.save();
            const notification = new Notification({
                from:userId,
                to:post.user,
                type:"like",
            })
            await notification.save();
            const updatedLikes = post.likes
            res.status(200).json(updatedLikes)
        }
    } catch (error) {
        console.log("Error in likeUnlike",error);
        res.status(500).json({error:error.message})
    }
}

export const getAllPosts = async (req, res) => {
    try {
      // Fetch posts and populate associated user and comments' user details
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({
          path: "comments.user",
          select: "-password",
        });
  
      // Return an empty array if no posts are found
      if (!posts || posts.length === 0) {
        return res.status(200).json([]);
      }
  
      // Return posts if found
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error in getAllPosts:", error.message); // Improved error logging
      res.status(500).json({ error: "An error occurred while fetching posts." }); // Return a generic error message
    }
  };
  
  export const getLikedPosts = async (req, res)=>{
    const userId = await req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            return res.ststus(404).json({error:"User not found"});

        }
        const likedPost = await Post.find({_id:{$in: user.likedPosts}}).populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        })
        res.status(200).json(likedPost)
    } catch (error) {
        console.error("Error in getLikedPosts:", error.message); // Improved error logging
        res.status(500).json({ error: "An error occurred while fetching posts." }); //    
    }
  }

export const getFollowingPosts = async (req,res)=>{
    try {
         const userId = req.user._id;
         const user =await User.findById(userId);
         if(!user) return res.status(404).json({error:"User not found"});
         const following = user.following;
         const feedPosts = await Post.find({user:{$in: following}}).sort({createdAt:-1}).populate({
            path:"user",
            select:"-password",
         }).populate({
            path:"comments.user",
            select:"-password",
         })
         res.status(200).json(feedPosts)
    } catch (error) {
        console.error("Error in getFollowingPosts:", error.message); // Improved error logging
        res.status(500).json({ error: "An error occurred while fetching posts." })   
    }
}

export const getUserPosts = async (req,res)=>{
    try {
        const {username}=req.params;
        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error:"User not found"});
        const posts = await Post.find({user:user._id}).sort({createdAt:-1}).populate({
            path:"user",
            select:"-password",
         }).populate({
            path:"comments.user",
            select:"-password",
         })
        res.status(200).json(posts);

    } catch (error) {
        console.error("Error in getUserPosts:", error.message); // Improved error logging
        res.status(500).json({ error: "An error occurred while fetching posts." })   
    }
}