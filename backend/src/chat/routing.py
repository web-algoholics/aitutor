import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth.auth import current_active_user
from auth.models import User
from langchain_gigachat import GigaChat
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
  role: str  # "user" | "assistant" | "system"
  content: str


class ChatRequest(BaseModel):
  messages: List[ChatMessage]


class ChatResponse(BaseModel):
  reply: str


def get_gigachat_client() -> GigaChat:
  try:
    return GigaChat(
      credentials=settings.GIGACHAT_API_KEY,
      model="GigaChat",
      temperature=0.4,
      max_tokens=4096,
      verify_ssl_certs=False,
    )
  except Exception as e:
    logger.error(f"Failed to create GigaChat client: {e}")
    raise HTTPException(status_code=500, detail=f"GigaChat init error: {e}")


@router.post("", response_model=ChatResponse)
async def chat_with_mai(
  payload: ChatRequest,
  user: User = Depends(current_active_user),
  client: GigaChat = Depends(get_gigachat_client),
):
  """
  Простой чат‑эндпоинт: принимает историю сообщений и возвращает ответ GigaChat.
  """
  if not payload.messages:
    raise HTTPException(status_code=400, detail="Empty messages")

  # Формируем промпт из истории
  # Можно улучшить форматирование при необходимости
  history_text = ""
  for m in payload.messages:
    prefix = "Пользователь:" if m.role == "user" else "Май:" if m.role == "assistant" else "Система:"
    history_text += f"{prefix} {m.content}\n"

  prompt = (
    "Ты — AI‑тьютор по программированию по имени Май в онлайн‑школе EdGen.. "
    "Ты помогаешь пользователю разбираться с курсами, теориями, квизами и код‑заданиями на нашем сайте. "
    "Отвечай на русском, опираясь на базовые знания программирования и общую логику.\n\n"
    "**Твои основные задачи:**\n"
    "1. Помогать с вопросами по программированию и обучению\n"
    "2. Отвечать на вопросы о платформе AI Tutor и её возможностях\n"
    "3. Объяснять, как работают функции платформы\n"
    "4. Помогать с навигацией и использованием курсов\n\n"
    "**Возможности платформы EdGen.:**\n"
    "- Курсы по программированию (Python, JavaScript, React, TypeScript, Go и др.) с модулями и уроками\n"
    "- AI-генерация персональных курсов по любой теме\n"
    "- Теория с автоматически генерируемым контентом\n"
    "- Квизы для проверки знаний\n"
    "- Код-задания с автоматической проверкой\n"
    "- Anki карточки для заучивания материала\n"
    "- Отслеживание прогресса по курсам и модулям\n"
    "- Стрик — количество дней подряд, которые ты занимаешься (растёт при ежедневных занятиях, сбрасывается при пропуске дня)\n"
    "- Анализ рынка вакансий с hh.ru для рекомендаций по навыкам\n"
    "- Чат с AI-тьютором (ты сама)\n\n"
    "**Важно:**\n"
    "- Если пользователь спрашивает о конкретных данных (прогресс, курсы, стрик), но ты их не видишь в вопросе, "
    "вежливо объясни, что для точного ответа нужно посмотреть в интерфейсе платформы\n"
    "- Если вопрос не про программирование, обучение или платформу, ответь кратко и вежливо, "
    "что твоя основная специализация — помощь в обучении программированию и работе с платформой AEdGen.\n\n"
    f"{history_text}\nМай:"
)

  try:
    response = client.invoke(prompt)
    text = str(getattr(response, "content", "") or response)
    return ChatResponse(reply=text.strip())
  except Exception as e:
    logger.error(f"GigaChat error: {e}")
    raise HTTPException(status_code=500, detail=f"GigaChat request failed: {e}")


