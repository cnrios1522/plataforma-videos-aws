import os

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import User, Video, Comment
from schemas import UserCreate, LoginRequest, VideoUpdate, CommentCreate
from security import hash_password, verify_password
from s3_service import upload_file, VIDEO_BUCKET, THUMBNAIL_BUCKET


app = FastAPI(
    title="VideoHub API"
)


frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        frontend_url
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_db_and_tables()


@app.get("/")
def home():
    return {
        "message": "VideoHub API funcionando"
    }
    
@app.post("/users")
def create_user(
    data: UserCreate,
    session: Session = Depends(get_session)
):

    existing_user = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password)
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }
    
@app.post("/login")
def login(
    data: LoginRequest,
    session: Session = Depends(get_session)
):

    user = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    return {
        "message": "Login correcto",
        "id": user.id,
        "name": user.name,
        "email": user.email
    }
    
@app.get("/users/{user_id}")
def get_user(
    user_id: int,
    session: Session = Depends(get_session)
):

    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    videos = session.exec(
        select(Video).where(
            Video.user_id == user_id
        )
    ).all()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "video_count": len(videos)
    }
    
@app.post("/videos")
def create_video(
    title: str = Form(...),
    description: str = Form(...),
    user_id: int = Form(...),

    video_file: UploadFile = File(...),
    thumbnail_file: UploadFile = File(...),

    session: Session = Depends(get_session)
):

    # Validar usuario
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # Validar MP4
    if video_file.content_type != "video/mp4":
        raise HTTPException(
            status_code=400,
            detail="El video debe ser MP4"
        )

    # Validar tamaño máximo 100 MB
    video_file.file.seek(0, 2)
    size = video_file.file.tell()
    video_file.file.seek(0)

    max_size = 100 * 1024 * 1024

    if size > max_size:
        raise HTTPException(
            status_code=400,
            detail="El video no puede superar los 100 MB"
        )

    # Validar miniatura
    allowed_images = [
        "image/jpeg",
        "image/png"
    ]

    if thumbnail_file.content_type not in allowed_images:
        raise HTTPException(
            status_code=400,
            detail="La miniatura debe ser JPG, JPEG o PNG"
        )

    # Subir archivos a S3
    video_url = upload_file(
        video_file,
        VIDEO_BUCKET
    )

    thumbnail_url = upload_file(
        thumbnail_file,
        THUMBNAIL_BUCKET
    )

    # Guardar información en la base
    video = Video(
        title=title,
        description=description,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        user_id=user_id
    )

    session.add(video)
    session.commit()
    session.refresh(video)

    return video
@app.get("/videos")
def get_videos(
    session: Session = Depends(get_session)
):

    videos = session.exec(
        select(Video)
    ).all()

    result = []

    for video in videos:

        user = session.get(
            User,
            video.user_id
        )

        result.append({
            "id": video.id,
            "title": video.title,
            "thumbnail_url": video.thumbnail_url,
            "views": video.views,
            "created_at": video.created_at,
            "user_id": video.user_id,
            "user_name": user.name if user else "Usuario"
        })

    return result
@app.get("/videos/{video_id}")
def get_video(
    video_id: int,
    session: Session = Depends(get_session)
):

    video = session.get(
        Video,
        video_id
    )

    if not video:
        raise HTTPException(
            status_code=404,
            detail="Video no encontrado"
        )

    video.views += 1

    session.add(video)
    session.commit()
    session.refresh(video)

    user = session.get(
        User,
        video.user_id
    )

    return {
        "id": video.id,
        "title": video.title,
        "description": video.description,
        "video_url": video.video_url,
        "thumbnail_url": video.thumbnail_url,
        "views": video.views,
        "created_at": video.created_at,
        "user_id": video.user_id,
        "user_name": user.name if user else "Usuario"
    }
@app.put("/videos/{video_id}")
def update_video(
    video_id: int,
    data: VideoUpdate,
    session: Session = Depends(get_session)
):

    video = session.get(
        Video,
        video_id
    )

    if not video:
        raise HTTPException(
            status_code=404,
            detail="Video no encontrado"
        )

    video.title = data.title
    video.description = data.description

    session.add(video)
    session.commit()
    session.refresh(video)

    return video
@app.delete("/videos/{video_id}")
def delete_video(
    video_id: int,
    session: Session = Depends(get_session)
):

    video = session.get(
        Video,
        video_id
    )

    if not video:
        raise HTTPException(
            status_code=404,
            detail="Video no encontrado"
        )

    session.delete(video)
    session.commit()

    return {
        "message": "Video eliminado"
    }
@app.get("/users/{user_id}/videos")
def get_user_videos(
    user_id: int,
    session: Session = Depends(get_session)
):

    videos = session.exec(
        select(Video).where(
            Video.user_id == user_id
        )
    ).all()

    return videos
@app.post("/videos/{video_id}/comments")
def create_comment(
    video_id: int,
    data: CommentCreate,
    session: Session = Depends(get_session)
):

    comment = Comment(
        content=data.content,
        user_id=data.user_id,
        video_id=video_id
    )

    session.add(comment)
    session.commit()
    session.refresh(comment)

    return comment
@app.get("/videos/{video_id}/comments")
def get_comments(
    video_id: int,
    session: Session = Depends(get_session)
):

    comments = session.exec(
        select(Comment).where(
            Comment.video_id == video_id
        )
    ).all()

    result = []

    for comment in comments:

        user = session.get(
            User,
            comment.user_id
        )

        result.append({
            "id": comment.id,
            "content": comment.content,
            "created_at": comment.created_at,
            "user_name": user.name if user else "Usuario"
        })

    return result
@app.get("/videos/{video_id}/recommended")
def get_recommended_videos(
    video_id: int,
    session: Session = Depends(get_session)
):

    videos = session.exec(
        select(Video).where(
            Video.id != video_id
        ).limit(4)
    ).all()

    return videos
