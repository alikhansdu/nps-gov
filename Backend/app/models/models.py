import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base


class UserRole(str, enum.Enum):
    citizen = "citizen"
    government = "government"


class SurveyStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    completed = "completed"


class QuestionType(str, enum.Enum):
    single = "single"
    multiple = "multiple"
    text = "text"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    iin: Mapped[str | None] = mapped_column(String(12), unique=True, index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.citizen)
    region_id: Mapped[int | None] = mapped_column(ForeignKey("regions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")
    age: Mapped[int | None] = mapped_column(nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)

    region: Mapped["Region | None"] = relationship(back_populates="users")
    surveys_created: Mapped[list["Survey"]] = relationship(back_populates="creator", foreign_keys="Survey.created_by")
    responses: Mapped[list["Response"]] = relationship(back_populates="user")


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)

    users: Mapped[list[User]] = relationship(back_populates="region")
    surveys: Mapped[list["Survey"]] = relationship(back_populates="region")


class Survey(Base):
    __tablename__ = "surveys"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[SurveyStatus] = mapped_column(Enum(SurveyStatus, name="survey_status"), default=SurveyStatus.draft)
    region_id: Mapped[int | None] = mapped_column(ForeignKey("regions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    creator: Mapped[User] = relationship(back_populates="surveys_created", foreign_keys=[created_by])
    region: Mapped[Region | None] = relationship(back_populates="surveys")
    questions: Mapped[list["Question"]] = relationship(back_populates="survey", cascade="all, delete-orphan")
    responses: Mapped[list["Response"]] = relationship(back_populates="survey", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    survey_id: Mapped[int] = mapped_column(ForeignKey("surveys.id"))
    question_text: Mapped[str] = mapped_column(Text)
    question_type: Mapped[QuestionType] = mapped_column(Enum(QuestionType, name="question_type"))
    order_index: Mapped[int] = mapped_column(default=0)

    survey: Mapped[Survey] = relationship(back_populates="questions")
    options: Mapped[list["Option"]] = relationship(back_populates="question", cascade="all, delete-orphan")
    responses: Mapped[list["Response"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class Option(Base):
    __tablename__ = "options"

    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"))
    option_text: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(default=0)

    question: Mapped[Question] = relationship(back_populates="options")
    responses: Mapped[list["Response"]] = relationship(back_populates="option")


class Response(Base):
    __tablename__ = "responses"
    __table_args__ = (
        UniqueConstraint("user_id", "survey_id", "question_id", name="uq_response_user_survey_question"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    survey_id: Mapped[int] = mapped_column(ForeignKey("surveys.id"))
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"))
    option_id: Mapped[int | None] = mapped_column(ForeignKey("options.id"), nullable=True)
    text_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="responses")
    survey: Mapped[Survey] = relationship(back_populates="responses")
    question: Mapped[Question] = relationship(back_populates="responses")
    option: Mapped[Option | None] = relationship(back_populates="responses")