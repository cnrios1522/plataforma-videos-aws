from sqlmodel import SQLModel


class UserCreate(SQLModel):
    name: str
    email: str
    password: str


class LoginRequest(SQLModel):
    email: str
    password: str


class VideoUpdate(SQLModel):
    title: str
    description: str


class CommentCreate(SQLModel):
    content: str
    user_id: int