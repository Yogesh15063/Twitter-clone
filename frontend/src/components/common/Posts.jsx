import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "react-query";
import { useState, useEffect } from "react";

const Posts = ({ feedType }) => {
  const [localPosts, setLocalPosts] = useState([]); // Manage posts locally

  // Dynamically get the correct endpoint
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  // Fetch posts with react-query
  const { isLoading, data: posts, refetch, isRefetching } = useQuery({
    queryKey: ["posts", feedType], // Include feedType in the queryKey to refetch on type change
    queryFn: async () => {
      const res = await fetch(POST_ENDPOINT);
      if (!res.ok) {
        throw new Error("Failed to fetch posts.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setLocalPosts(data); // Store posts in local state
    },
  });

  // Refetch posts when the feedType changes
  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  // Handle deletion by updating local state
  const handlePostDelete = (postId) => {
    setLocalPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && localPosts.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && localPosts.length > 0 && (
        <div>
          {localPosts.map((post) => (
            <Post
              key={post._id}
              post={post}
              feedType={feedType}
              onDeletePost={handlePostDelete} // Pass the delete handler to Post component
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
