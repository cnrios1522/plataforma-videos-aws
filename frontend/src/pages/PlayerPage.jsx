import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";
import API_URL from "../api";

function PlayerPage() {
  const { id } = useParams();

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [newComment, setNewComment] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const loadVideo = async () => {
    const response = await fetch(
      `${API_URL}/videos/${id}`
    );

    if (response.ok) {
      const data = await response.json();
      setVideo(data);
    }
  };

  const loadComments = async () => {
    const response = await fetch(
      `${API_URL}/videos/${id}/comments`
    );

    if (response.ok) {
      const data = await response.json();
      setComments(data);
    }
  };

  const loadRecommended = async () => {
    const response = await fetch(
      `${API_URL}/videos/${id}/recommended`
    );

    if (response.ok) {
      const data = await response.json();
      setRecommended(data);
    }
  };

  useEffect(() => {
    loadVideo();
    loadComments();
    loadRecommended();
  }, [id]);

  const addComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    const response = await fetch(
      `${API_URL}/videos/${id}/comments`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          content: newComment,
          user_id: user.id,
        }),
      }
    );

    if (response.ok) {
      setNewComment("");
      loadComments();
    }
  };

  if (!video) {
    return (
      <>
        <Header />
        <div className="container">
          <p>Cargando video...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="player-container">

        <section className="player-main">

          <video
            className="video-player"
            controls
            src={video.video_url}
          />

          <h1>{video.title}</h1>

          <div className="video-info">

            <strong>
              {video.user_name}
            </strong>

            <span>
              {video.views} vistas
            </span>

          </div>

          <p className="video-description">
            {video.description}
          </p>

          <section className="comments-section">

            <h2>
              Comentarios
            </h2>

            <form
              className="comment-form"
              onSubmit={addComment}
            >

              <input
                type="text"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) =>
                  setNewComment(e.target.value)
                }
              />

              <button type="submit">
                Comentar
              </button>

            </form>

            <div className="comments-list">

              {comments.length === 0 ? (
                <p>
                  Todavía no hay comentarios.
                </p>
              ) : (
                comments.map((comment) => (

                  <div
                    className="comment"
                    key={comment.id}
                  >

                    <strong>
                      {comment.user_name}
                    </strong>

                    <p>
                      {comment.content}
                    </p>

                    <small>
                      {new Date(
                        comment.created_at
                      ).toLocaleDateString()}
                    </small>

                  </div>

                ))
              )}

            </div>

          </section>

        </section>


        <aside className="recommended">

          <h2>
            Videos recomendados
          </h2>

          {recommended.length === 0 ? (

            <p>
              No hay videos recomendados.
            </p>

          ) : (

            recommended.map((item) => (

              <Link
                to={`/video/${item.id}`}
                className="recommended-card"
                key={item.id}
              >

                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                />

                <div>

                  <strong>
                    {item.title}
                  </strong>

                  <p>
                    {item.views} vistas
                  </p>

                </div>

              </Link>

            ))

          )}

        </aside>

      </main>
    </>
  );
}

export default PlayerPage;