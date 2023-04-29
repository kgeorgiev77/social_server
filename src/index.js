const express = require("express");
const { json, urlencoded } = require("body-parser");
const { randomBytes } = require("crypto");
const cookies = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const db = require("../db.json");
const port = process.env.PORT || 3000;
const app = express();

// Store
const store = {
  users: db.users,
  socialPosts: db.socialPosts,
  sessions: db.sessions,
};

const whitelist = ["http://localhost:3001"]
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}))
app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookies());

const checkAuth = (req, res, next) => {
  const { sessionId } = req.cookies;
  if (!sessionId) {
    return res.status(401).send({ error: "SessionId is required" });
  }

  const { sessions } = store;
  const session = sessions.find(session => session.id === sessionId);
  if (!session) {
    return res.status(401).send({ error: 'Not authorized' });
  }

  req.userId = session.userId;
  next();
};

const updateDb = (newUsers, newPosts, newSessions) => {
  const { users, socialPosts, sessions } = store;
  const db = {
    users: newUsers || users,
    socialPosts: newPosts || socialPosts,
    sessions: newSessions || sessions,
  };

  store.socialPosts = db.socialPosts;
  store.users = db.users;
  store.sessions = db.sessions;

  const filePath = path.join(__dirname, "../db.json");
  const data = JSON.stringify(db, null, 2);
  fs.writeFileSync(filePath, data);
}


const addToSessions = (session) => {
  const { sessions } = store;
  sessions.push(session);
  updateDb(null, null, sessions);
};

const removeFromSessions = (sessionId) => {
  const { sessions } = store;
  const newSessions = sessions.filter(session => session.id !== sessionId);
  updateDb(null, null, newSessions);
};

app.get('/', (req, res) => res.send('Welcome to the Simple Social media API!'));

app.post("/register", (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).send({ error: "Name is required" });

  if (store.users.find(user => user.name === name)) {
    return res.status(400).send({ error: "User already exists" });
  }

  const user = {
    id: randomBytes(16).toString("hex"),
    name,
  };

  const { users } = store;
  users.push(user);
  updateDb(users);
  res.status(201).send();
});

app.post("/login", (req, res) => {
  const { name } = req.body;
  const { users } = store;
  const user = users.find(user => user.name === name);

  if (!user) {
    return res.status(404).send();
  }

  const { sessions } = store;
  const sessionExist = sessions.find(session => session.userId === user.id);
  if (sessionExist) {
    res.cookie("sessionId", sessionExist.id, { httpOnly: true, expires: new Date(Date.now() + 900000) });
    res.status(200).send();
    return;
  }

  const session = {
    id: randomBytes(16).toString("hex"),
    userId: user.id,
  };

  addToSessions(session);
  res.cookie("sessionId", session.id, { httpOnly: true, expires: new Date(Date.now() + 900000) });
  res.status(201).send(session);
});

app.post("/logout", (req, res) => {
  const { sessionId } = req.cookies;
  console.log({ sessionId });
  if (!sessionId) {
    return res.status(400).send({ error: "SessionId is required" });
  }

  const { sessions } = store;
  const session = sessions.find(session => session.id === sessionId);
  if (!session) {
    return res.status(404).send({ error: "Session not found" });
  }

  removeFromSessions(sessionId);
  res.clearCookie("sessionId");
  res.status(201).send();
});

app.get("/posts", checkAuth, (req, res) => {
  const { socialPosts } = store;

  const posts = socialPosts.map(post => {
    const { users } = store;
    const user = users.find(user => user.id === post.userId);
    postCopy = { ...post };
    postCopy.userName = user.name;
    postCopy.likes = postCopy.likes?.length ?? 0;
    delete postCopy.userId;
    return postCopy;
  });

  res.send(posts || []);
});

app.get("/posts/:id", checkAuth, (req, res) => {
  const { id } = req.params;
  const { socialPosts } = store;
  const post = socialPosts.find(post => post.id === id);
  if (!post) {
    return res.status(404).send();
  }

  res.send(post);
});

app.post("/posts/:id/like", checkAuth, (req, res) => {
  // like a post
  const { id } = req.params;
  const { socialPosts } = store;
  // update a post likes

  const post = socialPosts.find(post => post.id === id);
  if (!post) {
    return res.status(404).send();
  }

  const { userId } = req;
  const { likes } = post;
  const like = likes.find(like => like === userId);
  if (like) {
    return res.status(400).send({ error: "You already liked this post" });
  }

  likes.push(userId);
  updateDb(null, socialPosts, null);
  res.status(201).send();
});

app.post("/posts", checkAuth, (req, res) => {
  const { userId } = req;
  const { content } = req.body;
  if (!content) {
    return res.status(400).send({ error: "Content is required" });
  }

  const post = {
    id: randomBytes(16).toString("hex"),
    userId,
    content,
    likes: [],
  };

  const { socialPosts } = store;
  socialPosts.push(post);
  updateDb(null, socialPosts, null);
  res.status(201).send(post);
});

app.delete("/posts/:id", checkAuth, (req, res) => {
  const { id } = req.params;
  const { socialPosts } = store;
  const post = socialPosts.find(post => post.id === id);

  if (!post) {
    return res.status(404).send();
  }

  if (post.userId !== req.userId) {
    return res.status(401).send({ error: "Not authorized" });
  }


  const newPosts = socialPosts.filter(post => post.id !== id);
  updateDb(null, newPosts);
  res.status(201).send();
});

app.listen(port, () => {
  console.log(`Simple Social Media API listening on port ${port}!`);
});