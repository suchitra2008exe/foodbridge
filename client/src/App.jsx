import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  // --------------------------------
  // Food and impact data
  // --------------------------------

  const [posts, setPosts] = useState([]);

  const [stats, setStats] = useState({
    servingsSaved: 0,
    servingsMissed: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // --------------------------------
  // Live countdown
  // --------------------------------

  const [currentTime, setCurrentTime] = useState(Date.now());

  // --------------------------------
  // Give Food form
  // --------------------------------

  const [foodName, setFoodName] = useState("");
  const [servings, setServings] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [postedBy, setPostedBy] = useState("");

  // --------------------------------
  // Claim Food form
  // --------------------------------

  const [userIds, setUserIds] = useState({});
  const [quantities, setQuantities] = useState({});

  // --------------------------------
  // Live countdown timer
  // --------------------------------

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --------------------------------
  // Fetch available food
  // --------------------------------

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/posts?status=available`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch food");
      }

      const data = await response.json();

      setPosts(data.posts);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not load available food.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Fetch impact statistics
  // --------------------------------

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();

      setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------------
  // Initial data load
  // --------------------------------

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  // --------------------------------
  // Countdown formatter
  // --------------------------------

  const getTimeLeft = (expiresAt) => {
    const difference =
      new Date(expiresAt).getTime() - currentTime;

    if (difference <= 0) {
      return "Expired";
    }

    const totalSeconds = Math.floor(difference / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  // --------------------------------
  // Claim Food
  // --------------------------------

  const claimFood = async (postId) => {
    const userId = userIds[postId]?.trim();
    const quantity = Number(quantities[postId]);

    if (!userId) {
      alert("Please enter your User ID.");
      return;
    }

    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}/claims`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            userId,
            quantity
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);

        await fetchPosts();

        return;
      }

      alert(
        `Successfully claimed ${quantity} serving(s)!`
      );

      await fetchPosts();
      await fetchStats();

      // Clear User ID
      setUserIds((previous) => ({
        ...previous,
        [postId]: ""
      }));

      // Clear quantity
      setQuantities((previous) => ({
        ...previous,
        [postId]: ""
      }));

    } catch (err) {
      console.error(err);

      alert(
        "Something went wrong while claiming food."
      );
    }
  };

  // --------------------------------
  // Give Food
  // --------------------------------

  const handlePostFood = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/posts`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            foodName,
            servings: Number(servings),
            pickupPoint,
            expiresAt: new Date(
              expiresAt
            ).toISOString(),
            postedBy
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage(
        "Food posted successfully! 🌱"
      );

      // Clear form
      setFoodName("");
      setServings("");
      setPickupPoint("");
      setExpiresAt("");
      setPostedBy("");

      // Refresh data
      await fetchPosts();
      await fetchStats();

    } catch (err) {
      console.error(err);

      setMessage(
        "Could not post food."
      );
    }
  };

  // --------------------------------
  // Sort posts by time remaining
  // --------------------------------

  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(a.expiresAt).getTime() -
      new Date(b.expiresAt).getTime()
  );

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <main>

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <header>

        <h1>🌱 FoodBridge</h1>

        <p>
          Rescue food. Reduce waste.
        </p>

      </header>


      {/* ================================= */}
      {/* GIVE FOOD */}
      {/* ================================= */}

      <section>

        <h2>🥡 Give Food</h2>

        <form onSubmit={handlePostFood}>

          {/* Food name */}

          <div>

            <label>
              Food name
            </label>

            <br />

            <input
              type="text"
              value={foodName}
              onChange={(event) =>
                setFoodName(event.target.value)
              }
              placeholder="Eg. Veg Biryani"
              required
            />

          </div>

          <br />


          {/* Servings */}

          <div>

            <label>
              Number of servings
            </label>

            <br />

            <input
              type="number"
              min="1"
              value={servings}
              onChange={(event) =>
                setServings(event.target.value)
              }
              placeholder="Eg. 20"
              required
            />

          </div>

          <br />


          {/* Pickup point */}

          <div>

            <label>
              Pickup point
            </label>

            <br />

            <input
              type="text"
              value={pickupPoint}
              onChange={(event) =>
                setPickupPoint(event.target.value)
              }
              placeholder="Eg. AB Block Cafeteria"
              required
            />

          </div>

          <br />


          {/* Expiry */}

          <div>

            <label>
              Best before
            </label>

            <br />

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(event) =>
                setExpiresAt(event.target.value)
              }
              required
            />

          </div>

          <br />


          {/* Posted by */}

          <div>

            <label>
              Posted by
            </label>

            <br />

            <input
              type="text"
              value={postedBy}
              onChange={(event) =>
                setPostedBy(event.target.value)
              }
              placeholder="Eg. Food Club"
              required
            />

          </div>

          <br />


          {/* Submit */}

          <button type="submit">
            Post Surplus Food
          </button>

        </form>


        {message && (
          <p>{message}</p>
        )}

      </section>


      <hr />


      {/* ================================= */}
      {/* AVAILABLE FOOD */}
      {/* ================================= */}

      <section>

        <h2>🍱 Available Food</h2>


        {loading && (
          <p>
            Loading food...
          </p>
        )}


        {error && (
          <p>
            {error}
          </p>
        )}


        {!loading &&
          !error &&
          sortedPosts.length === 0 && (

            <p>
              No food is currently available.
            </p>

        )}


        {sortedPosts.map((post) => (

          <div key={post.id}>

            <h3>
              {post.foodName}
            </h3>


            <p>
              <strong>
                Servings:
              </strong>{" "}
              {post.servings}
            </p>


            <p>
              <strong>
                Pickup:
              </strong>{" "}
              {post.pickupPoint}
            </p>


            <p>
              <strong>
                Posted by:
              </strong>{" "}
              {post.postedBy}
            </p>


            {/* LIVE COUNTDOWN */}

            <p>

              <strong>
                ⏱ Time left:
              </strong>{" "}

              {getTimeLeft(
                post.expiresAt
              )}

            </p>


            {/* Actual expiry time */}

            <p>

              <strong>
                Best before:
              </strong>{" "}

              {new Date(
                post.expiresAt
              ).toLocaleString()}

            </p>


            {/* ================================= */}
            {/* CLAIM FOOD */}
            {/* ================================= */}

            <div>

              <label>
                Your User ID
              </label>

              <br />

              <input
                type="text"
                value={
                  userIds[post.id] || ""
                }
                onChange={(event) =>
                  setUserIds(
                    (previous) => ({
                      ...previous,
                      [post.id]:
                        event.target.value
                    })
                  )
                }
                placeholder="Eg. 25BRS1312"
              />


              <br />
              <br />


              <label>
                Servings to claim
              </label>

              <br />

              <input
                type="number"
                min="1"
                max={post.servings}
                value={
                  quantities[post.id] || ""
                }
                onChange={(event) =>
                  setQuantities(
                    (previous) => ({
                      ...previous,
                      [post.id]:
                        event.target.value
                    })
                  )
                }
                placeholder="Eg. 5"
              />


              <br />
              <br />


              <button
                onClick={() =>
                  claimFood(post.id)
                }
              >
                Claim Food
              </button>

            </div>


            <hr />

          </div>

        ))}

      </section>


      {/* ================================= */}
      {/* IMPACT */}
      {/* ================================= */}

      <section>

        <h2>
          🌍 FoodBridge Impact
        </h2>


        <p>

          <strong>
            Servings saved:
          </strong>{" "}

          {stats.servingsSaved}

        </p>


        <p>

          <strong>
            Servings missed:
          </strong>{" "}

          {stats.servingsMissed}

        </p>

      </section>

    </main>
  );
}

export default App;