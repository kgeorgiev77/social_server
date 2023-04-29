import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/PostCreation.css';

function CreatePost({onPostCreated}) {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, likes: 0 }),
      credentials: 'include',
    });
    if (response.ok) {
      setContent('');
      const newPost = await response.json();
      onPostCreated(newPost);
      navigate('/feed');
    } else {
      console.error('Failed to create post');
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
      />
      <button className="create-post-btn" type="submit">Post</button>
    </form>
  );
}

export default CreatePost;
