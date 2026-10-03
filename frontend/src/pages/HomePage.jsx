import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import API_URL from "../api";

function HomePage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/videos`)
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) =>
        console.error("Error:", error)
      );
  }, []);

  return (
    <>
      <Header />

      <main className="container">

        <h2>Videos recientes</h2>

        {videos.length === 0 ? (

          <p>
            Todavía no hay videos publicados.
          </p>

        ) : (

          <div className="video-grid">

            {videos.map((video) => (

              <Link
                key={video.id}
                to={`/video/${video.id}`}
                className="video-card"
              >

                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                />

                <h3>
                  {video.title}
                </h3>

                <p>
                  {video.user_name}
                </p>

                <p>
                  {video.views} vistas
                </p>

                <p>
                  {new Date(
                    video.created_at
                  ).toLocaleDateString()}
                </p>

              </Link>

            ))}

          </div>

        )}

      </main>
    </>
  );
}

export default HomePage;