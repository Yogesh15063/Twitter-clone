import { FaRegComment, FaRegHeart, FaRegBookmark, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post, feedType, onDeletePost }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  // Mutation to delete post
  const { mutate: deletePost, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete post.");
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      onDeletePost(post._id); // Call the delete handler passed from parent
      queryClient.invalidateQueries(["posts", feedType]); // Optionally refetch the posts
    },
    onError: () => {
      toast.error("Failed to delete post.");
    },
  });

  const postOwner = post?.user || {};
  const isMyPost = authUser?._id === post?.user?._id;

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link to={`/profile/${postOwner?.username || "unknown"}`} className="w-8 rounded-full overflow-hidden">
          <img src={postOwner?.profileImg || "/avatar-placeholder.png"} alt="Profile" />
        </Link>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner?.username || "unknown"}`} className="font-bold">
            {postOwner?.fullname || "Unknown User"}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner?.username || "unknown"}`}>@{postOwner?.username || "unknown"}</Link>
            <span>·</span>
            <span>1h</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isPending ? (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={() => deletePost()}
                />
              ) : (
                <LoadingSpinner size="sm" />
              )}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post?.text || ""}</span>
          {post?.img && (
            <img src={post.img} className="h-80 object-contain rounded-lg border border-gray-700" alt="Post" />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div className="flex gap-1 items-center cursor-pointer group">
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">{post?.comments?.length || 0}</span>
            </div>
            <div className="flex gap-1 items-center group cursor-pointer">
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
              <span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
            </div>
            <div className="flex gap-1 items-center group cursor-pointer">
              <FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500" />
              <span className="text-sm text-slate-500 group-hover:text-pink-500">{post?.likes?.length || 0}</span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
