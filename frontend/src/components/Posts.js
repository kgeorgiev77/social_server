import React, { useState, useEffect, useContext } from "react";
import { SessionContext } from "./SessionContext";
import CreatePost from "./PostCreation";
import '../css/Posts.css';

function Post({ post, onLike, onDelete }) {
  const {sessionData} = useContext(SessionContext);

  const handleLike = async () => {
    try {
      await fetch(`http://localhost:3000/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      onLike(post.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      onDelete(post.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="post">
      <h2 className="content">{post.content}</h2>
      <h2 className="content">{post.userId}</h2>
      <h3 className="likes">Likes: {post.likes}</h3>
      <div className="actions">
        {post.userName !== null && <button className="action" onClick={handleLike}>Like</button>}
        {post.userName === sessionData && <button className="delete" onClick={handleDelete}>Delete</button>}
      </div>
    </div>
  );
}

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:3000/posts", { credentials: "include" });
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchPosts();

    const intervalId = setInterval(fetchPosts, 2000);

    return () => clearInterval(intervalId);

  }, []);

  const handleLike = async (postId) => {
    try {
      const updatedPost = await fetch(`http://localhost:3000/posts/${postId}`, {
        credentials: "include",
      });
      const updatedPostData = await updatedPost.json();
      setPosts(posts =>
        posts.map((post) => {
          if (post.id === postId) {
            return { ...post, likes: updatedPostData.likes.length };
          }
          return post;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostCreated = async (newPost) => {
    try {
      const response = await fetch("http://localhost:3000/posts", {
        credentials: "include",
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleDelete = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  return (
    <div className="posts">
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.length > 0 &&
        posts.map((post) => (
          <Post key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
        ))}
    </div>
  );
}

export default Posts;
