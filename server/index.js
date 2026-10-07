const express = require("express");
const cors = require("cors");

const posts = require("./data/posts");
const claims = require("./data/claims");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ------------------------------------
// Helper: Update expired posts
// ------------------------------------

function updateExpiredPosts() {
  const now = new Date();

  posts.forEach((post) => {
    if (
      post.status === "available" &&
      new Date(post.expiresAt) <= now
    ) {
      post.status = "expired";
    }
  });
}


// ------------------------------------
// Health check
// ------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "FoodBridge backend is running!"
  });
});


// ------------------------------------
// API test
// ------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "FoodBridge API is working!"
  });
});


// ------------------------------------
// GET all food posts
// ------------------------------------

app.get("/api/posts", (req, res) => {
  updateExpiredPosts();

  const status = req.query.status;

  let result = posts;

  if (status) {
    result = posts.filter((post) => post.status === status);
  }

  res.json({
    success: true,
    posts: result
  });
});


// ------------------------------------
// GET single food post
// ------------------------------------

app.get("/api/posts/:id", (req, res) => {
  updateExpiredPosts();

  const id = Number(req.params.id);

  const post = posts.find((post) => post.id === id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Food post not found"
    });
  }

  res.json({
    success: true,
    post
  });
});


// ------------------------------------
// CREATE food post
// ------------------------------------

app.post("/api/posts", (req, res) => {
  const {
    foodName,
    servings,
    pickupPoint,
    expiresAt,
    postedBy
  } = req.body;

  if (
    !foodName ||
    !servings ||
    !pickupPoint ||
    !expiresAt
  ) {
    return res.status(400).json({
      success: false,
      message: "Food name, servings, pickup point and expiry time are required"
    });
  }

  const expiryDate = new Date(expiresAt);

  if (isNaN(expiryDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid expiry time"
    });
  }

  if (expiryDate <= new Date()) {
    return res.status(400).json({
      success: false,
      message: "Expiry time must be in the future"
    });
  }

  const newPost = {
    id: posts.length > 0
      ? Math.max(...posts.map((post) => post.id)) + 1
      : 1,

    foodName,
    servings: Number(servings),
    originalServings: Number(servings),
    pickupPoint,
    expiresAt: expiryDate.toISOString(),
    postedBy: postedBy || "Anonymous",
    status: "available",
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);

  res.status(201).json({
    success: true,
    message: "Food posted successfully",
    post: newPost
  });
});


// ------------------------------------
// CLAIM food
// ------------------------------------

app.post("/api/posts/:id/claims", (req, res) => {
  updateExpiredPosts();

  const postId = Number(req.params.id);

  const { userId, quantity } = req.body;

  const post = posts.find((post) => post.id === postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Food post not found"
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be greater than 0"
    });
  }

  if (post.status !== "available") {
    return res.status(400).json({
      success: false,
      message: "This food is no longer available"
    });
  }

  if (new Date(post.expiresAt) <= new Date()) {
    post.status = "expired";

    return res.status(400).json({
      success: false,
      message: "This food has expired"
    });
  }

  if (quantity > post.servings) {
    return res.status(400).json({
      success: false,
      message: `Only ${post.servings} servings are available`
    });
  }


  // Reduce available servings
  post.servings -= Number(quantity);


  // Save claim
  const claim = {
    id: claims.length + 1,
    postId: post.id,
    userId,
    servingsClaimed: Number(quantity),
    claimedAt: new Date().toISOString()
  };

  claims.push(claim);


  // Close post when all servings are claimed
  if (post.servings === 0) {
    post.status = "claimed";
  }


  res.json({
    success: true,
    message: "Food claimed successfully",
    claim,
    remainingServings: post.servings,
    postStatus: post.status
  });
});


// ------------------------------------
// GET claims
// ------------------------------------

app.get("/api/claims", (req, res) => {
  res.json({
    success: true,
    claims
  });
});


// ------------------------------------
// GET impact statistics
// ------------------------------------

app.get("/api/stats", (req, res) => {
  updateExpiredPosts();

  const servingsSaved = claims.reduce(
    (total, claim) => total + claim.servingsClaimed,
    0
  );

  const servingsMissed = posts.reduce(
    (total, post) => {
      if (post.status === "expired") {
        return total + post.servings;
      }

      return total;
    },
    0
  );

  res.json({
    success: true,
    stats: {
      servingsSaved,
      servingsMissed
    }
  });
});


// ------------------------------------
// Start server
// ------------------------------------

app.listen(PORT, () => {
  console.log(`FoodBridge server running on port ${PORT}`);
});