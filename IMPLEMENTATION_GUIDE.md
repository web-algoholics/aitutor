# Руководство по реализации улучшений

## 1. Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend/src:/app/src
      - ./backend/uploads:/app/uploads
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=app_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    env_file:
      - .env.local

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    volumes:
      - ./src:/app/src
      - /app/node_modules
    ports:
      - "8099:8099"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### backend/Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p uploads/profile_icons

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile.frontend
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8099

CMD ["npm", "start"]
```

---

## 2. Модели курсов

### backend/src/courses/models.py
```python
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from typing import Optional, List
from datetime import datetime

class Course(SQLModel, table=True):
    __tablename__ = "courses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=100)
    description: str = Field(sa_column=Column(Text))
    language: str = Field(index=True, max_length=50)  # python, javascript, etc.
    hours: int = Field(default=0)
    projects: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    lessons: List["Lesson"] = Relationship(back_populates="course")
    enrollments: List["Enrollment"] = Relationship(back_populates="course")

class Lesson(SQLModel, table=True):
    __tablename__ = "lessons"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="courses.id")
    title: str = Field(max_length=200)
    description: str = Field(sa_column=Column(Text))
    duration_minutes: int = Field(default=0)
    order: int = Field(default=0)
    content: str = Field(sa_column=Column(Text))  # Markdown content
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    course: Course = Relationship(back_populates="lessons")
    progress: List["UserProgress"] = Relationship(back_populates="lesson")

class Enrollment(SQLModel, table=True):
    __tablename__ = "enrollments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    course_id: int = Field(foreign_key="courses.id")
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    progress_percent: int = Field(default=0)
    
    course: Course = Relationship(back_populates="enrollments")

class UserProgress(SQLModel, table=True):
    __tablename__ = "user_progress"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    lesson_id: int = Field(foreign_key="lessons.id")
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = None
    time_spent_minutes: int = Field(default=0)
    
    lesson: Lesson = Relationship(back_populates="progress")
```

### backend/src/courses/schemas.py
```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CourseRead(BaseModel):
    id: int
    name: str
    description: str
    language: str
    hours: int
    projects: int
    progress: Optional[int] = None  # For enrolled users

class CourseCreate(BaseModel):
    name: str
    description: str
    language: str
    hours: int = 0
    projects: int = 0

class LessonRead(BaseModel):
    id: int
    course_id: int
    title: str
    description: str
    duration_minutes: int
    order: int
    completed: Optional[bool] = None  # For enrolled users

class EnrollmentRead(BaseModel):
    id: int
    course: CourseRead
    enrolled_at: datetime
    progress_percent: int
```

### backend/src/courses/routing.py
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List

from database import get_session
from auth.auth import current_active_user
from auth.models import User
from .models import Course, Enrollment, Lesson, UserProgress
from .schemas import CourseRead, CourseCreate, EnrollmentRead

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[CourseRead])
async def get_courses(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_active_user)
):
    """Get all available courses"""
    result = await session.exec(select(Course).where(Course.is_active == True))
    courses = result.all()
    
    # Get user's enrollments
    enrollments_result = await session.exec(
        select(Enrollment).where(Enrollment.user_id == user.id)
    )
    enrollments = {e.course_id: e for e in enrollments_result.all()}
    
    # Add progress to courses
    course_list = []
    for course in courses:
        course_dict = course.dict()
        if course.id in enrollments:
            course_dict["progress"] = enrollments[course.id].progress_percent
        course_list.append(CourseRead(**course_dict))
    
    return course_list

@router.post("/{course_id}/enroll", response_model=EnrollmentRead)
async def enroll_in_course(
    course_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_active_user)
):
    """Enroll user in a course"""
    # Check if course exists
    course = await session.get(Course, course_id)
    if not course or not course.is_active:
        raise HTTPException(404, "Course not found")
    
    # Check if already enrolled
    existing = await session.exec(
        select(Enrollment).where(
            Enrollment.user_id == user.id,
            Enrollment.course_id == course_id
        )
    )
    if existing.first():
        raise HTTPException(400, "Already enrolled in this course")
    
    # Create enrollment
    enrollment = Enrollment(user_id=user.id, course_id=course_id)
    session.add(enrollment)
    await session.commit()
    await session.refresh(enrollment)
    
    return EnrollmentRead(
        id=enrollment.id,
        course=CourseRead(**course.dict()),
        enrolled_at=enrollment.enrolled_at,
        progress_percent=enrollment.progress_percent
    )
```

---

## 3. AI Интеграция

### backend/src/ai/tutor.py
```python
from langchain_gigachat import GigaChat
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import settings
from typing import Optional

class AITutor:
    def __init__(self):
        self.llm = GigaChat(
            credentials=settings.GIGACHAT_API_KEY,
            model="GigaChat-Pro",
            temperature=0.7,
            verify_ssl_certs=False
        )
        self.output_parser = StrOutputParser()
    
    async def answer_question(
        self,
        question: str,
        context: Optional[str] = None,
        language: Optional[str] = None
    ) -> str:
        """Answer student's question with context"""
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", """You are an AI programming tutor. 
            Help students learn programming by providing clear, 
            concise explanations with code examples when relevant.
            If context is provided, use it to give more relevant answers."""),
            ("human", "{question}")
        ])
        
        if context:
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", f"Context: {context}\n\nYou are an AI programming tutor..."),
                ("human", "{question}")
            ])
        
        chain = prompt_template | self.llm | self.output_parser
        response = await chain.ainvoke({"question": question})
        return response
    
    async def generate_lesson_content(
        self,
        topic: str,
        level: str = "beginner",
        language: str = "python"
    ) -> dict:
        """Generate lesson content using AI"""
        prompt = f"""Create a programming lesson about {topic} for {level} level in {language}.
        Include:
        1. Introduction (2-3 paragraphs)
        2. Key concepts (bullet points)
        3. Code examples (with explanations)
        4. Practice exercises (3-5 exercises)
        5. Summary
        
        Format as JSON with keys: introduction, concepts, examples, exercises, summary."""
        
        chain = ChatPromptTemplate.from_messages([
            ("system", "You are an expert programming instructor. Generate structured lesson content."),
            ("human", prompt)
        ]) | self.llm | self.output_parser
        
        content = await chain.ainvoke({})
        # Parse JSON response (add error handling)
        return {"content": content}

tutor = AITutor()
```

### backend/src/ai/routing.py
```python
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from auth.auth import current_active_user
from auth.models import User
from .tutor import tutor

router = APIRouter(prefix="/ai", tags=["ai"])

class QuestionRequest(BaseModel):
    question: str
    context: Optional[str] = None
    language: Optional[str] = None

@router.post("/ask")
async def ask_question(
    request: QuestionRequest,
    user: User = Depends(current_active_user)
):
    """Ask AI tutor a question"""
    response = await tutor.answer_question(
        question=request.question,
        context=request.context,
        language=request.language
    )
    return {"answer": response}

@router.websocket("/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for real-time AI chat"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "question":
                response = await tutor.answer_question(
                    question=message.get("question", ""),
                    context=message.get("context"),
                    language=message.get("language")
                )
                await websocket.send_json({
                    "type": "answer",
                    "content": response
                })
    except WebSocketDisconnect:
        pass
```

---

## 4. Тесты

### frontend: src/__tests__/Dashboard.test.tsx
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../app/store';
import { Dashboard } from '../pages/Dashboard';

describe('Dashboard', () => {
  it('renders loading state', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays enrolled courses', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });
});
```

### backend: tests/test_courses.py
```python
import pytest
from httpx import AsyncClient
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool

from main import app
from courses.models import Course

@pytest.fixture
def session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture
def client(session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    yield AsyncClient(app=app, base_url="http://test")
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_courses(client):
    response = await client.get("/courses/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

---

## 5. Error Handling

### frontend: src/components/ErrorBoundary.tsx
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Send to Sentry
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 6. Environment Variables

### .env.example
```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_NAME=app_db

# Security
SECRET_KEY=your-secret-key-change-in-production
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASSWORD=your-strong-password

# Redis
REDIS_URL=redis://localhost:6379

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@aitutor.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=AI Tutor

# Frontend
FRONTEND_URL=http://localhost:8099

# AI
GIGACHAT_API_KEY=your-gigachat-api-key
```

---

## 7. Rate Limiting

### backend/src/middleware/rate_limit.py
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException

limiter = Limiter(key_func=get_remote_address)

def setup_rate_limiting(app):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Usage in routes:
@router.post("/ai/ask")
@limiter.limit("10/minute")
async def ask_question(request: Request, ...):
    ...
```

---

## 8. Code Splitting

### src/App.tsx (updated)
```typescript
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Roadmap = lazy(() => import('./pages/Roadmap'));

function App() {
  return (
    <Suspense fallback={<Spin size="large" />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

---

Эти примеры можно использовать как основу для реализации улучшений.

