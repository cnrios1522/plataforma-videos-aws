import { useEffect, useState } from "react";

import Header from "../components/Header";
import API_URL from "../api";

function ProfilePage() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [editingVideo, setEditingVideo] = useState(null);

  const loadProfile = async () => {
    const response = await fetch(
      `${API_URL}/users/${user.id}`
    );

    if (response.ok) {
      const data = await response.json();
      setProfile(data);
    }
  };

  const loadVideos = async () => {
    const response = await fetch(
      `${API_URL}/users/${user.id}/videos`
    );

    if (response.ok) {
      const data = await response.json();
      setVideos(data);
    }
  };

  useEffect(() => {
    loadProfile();
    loadVideos();
  }, []);

  const uploadVideo = async (e) => {
    e.preventDefault();

    if (!videoFile || !thumbnailFile) {
      alert("Selecciona el video y la miniatura");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("user_id", user.id);
    formData.append("video_file", videoFile);
    formData.append("thumbnail_file", thumbnailFile);

    const response = await fetch(
      `${API_URL}/videos`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      alert("Video publicado");

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);

      loadVideos();
      loadProfile();
    } else {
      const error = await response.json();

      alert(
        error.detail || "No se pudo publicar el video"
      );
    }
  };

  const startEdit = (video) => {
    setEditingVideo({
      id: video.id,
      title: video.title,
      description: video.description,
    });
  };

  const updateVideo = async () => {
    const response = await fetch(
      `${API_URL}/videos/${editingVideo.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: editingVideo.title,
          description: editingVideo.description,
        }),
      }
    );

    if (response.ok) {
      alert("Video actualizado");

      setEditingVideo(null);

      loadVideos();
    }
  };

  const deleteVideo = async (videoId) => {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este video?"
    );

    if (!confirmDelete) {
      return;
    }

    const response = await fetch(
      `${API_URL}/videos/${videoId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      alert("Video eliminado");

      loadVideos();
      loadProfile();
    }
  };

  return (
    <>
      <Header />

      <main className="profile-container">

        <section className="profile-info">

          <h1>Mi perfil</h1>

          {profile ? (
            <>
              <h2>{profile.name}</h2>

              <p>{profile.email}</p>

              <p>
                <strong>Videos publicados:</strong>{" "}
                {profile.video_count}
              </p>
            </>
          ) : (
            <p>Cargando perfil...</p>
          )}

        </section>


        <section className="upload-section">

          <h2>Publicar video</h2>

          <form
            className="upload-form"
            onSubmit={uploadVideo}
          >

            <label>Título</label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />


            <label>Descripción</label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
            />


            <label>
              Video MP4
            </label>

            <input
              type="file"
              accept="video/mp4"
              onChange={(e) =>
                setVideoFile(e.target.files[0])
              }
              required
            />


            <label>
              Miniatura JPG, JPEG o PNG
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) =>
                setThumbnailFile(
                  e.target.files[0]
                )
              }
              required
            />


            <button
              className="primary-button"
              type="submit"
            >
              Publicar video
            </button>

          </form>

        </section>


        <section className="my-videos">

          <h2>Mis videos</h2>

          {videos.length === 0 ? (

            <p>
              Todavía no has publicado videos.
            </p>

          ) : (

            <div className="profile-video-list">

              {videos.map((video) => (

                <div
                  className="profile-video-card"
                  key={video.id}
                >

                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                  />

                  <div className="profile-video-info">

                    <h3>
                      {video.title}
                    </h3>

                    <p>
                      {video.description}
                    </p>

                    <p>
                      {video.views} vistas
                    </p>

                    <div className="video-actions">

                      <button
                        onClick={() =>
                          startEdit(video)
                        }
                      >
                        Editar
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteVideo(video.id)
                        }
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {editingVideo && (

          <div className="edit-box">

            <h2>Editar video</h2>

            <label>
              Título
            </label>

            <input
              value={editingVideo.title}
              onChange={(e) =>
                setEditingVideo({
                  ...editingVideo,
                  title: e.target.value,
                })
              }
            />

            <label>
              Descripción
            </label>

            <textarea
              value={editingVideo.description}
              onChange={(e) =>
                setEditingVideo({
                  ...editingVideo,
                  description: e.target.value,
                })
              }
            />

            <div className="edit-buttons">

              <button
                className="primary-button"
                onClick={updateVideo}
              >
                Guardar cambios
              </button>

              <button
                onClick={() =>
                  setEditingVideo(null)
                }
              >
                Cancelar
              </button>

            </div>

          </div>

        )}

      </main>
    </>
  );
}

export default ProfilePage;