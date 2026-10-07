const posts = [
  {
    id: 1,
    foodName: "Veg Biryani",
    servings: 20,
    originalServings: 20,
    pickupPoint: "AB Block Cafeteria",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    postedBy: "Food Club",
    status: "available",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    foodName: "Sandwiches",
    servings: 10,
    originalServings: 10,
    pickupPoint: "Main Block Lobby",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    postedBy: "Events Team",
    status: "available",
    createdAt: new Date().toISOString()
  }
];

module.exports = posts;