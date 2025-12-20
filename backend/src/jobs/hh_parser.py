"""
Сервис для парсинга вакансий с hh.ru API
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
import re
import logging
from config import settings

logger = logging.getLogger(__name__)

HH_API_BASE = "https://api.hh.ru"

class HHParser:
    """Парсер для работы с API hh.ru"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=HH_API_BASE,
            timeout=30.0,
            headers={
                "User-Agent": "AI-Tutor/1.0 (learning platform)"
            }
        )
    
    async def search_vacancies(
        self,
        query: str,
        area: Optional[str] = None,
        experience: Optional[str] = None,
        per_page: int = 100,
        page: int = 0,
        *,
        employment: Optional[str] = None,
        schedule: Optional[str] = None,
        only_with_salary: bool = False,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Поиск вакансий через hh.ru API
        
        Args:
            query: Поисковый запрос
            area: Регион (код из hh.ru, например "1" для Москвы)
            experience: Уровень опыта (noExperience, between1And3, between3And6, moreThan6)
            per_page: Количество вакансий на странице (макс 100)
            page: Номер страницы
        
        Returns:
            Словарь с результатами поиска
        """
        params = {
            "text": query,
            "per_page": min(per_page, 100),
            "page": page,
            # флаг only_with_salary позволяет фильтровать вакансии с указанной зарплатой
            "only_with_salary": only_with_salary,
        }
        
        if area:
            # если передан числовой код региона HH – используем как area
            if isinstance(area, str) and area.strip().isdigit():
                params["area"] = area.strip()
            else:
                # иначе добавляем регион в текст запроса, чтобы искать по названию города
                params["text"] = f"{query} {area}".strip()
        
        if experience:
            params["experience"] = experience

        # Дополнительные фильтры HH API
        if employment:
            params["employment"] = employment

        if schedule:
            params["schedule"] = schedule

        if date_from:
            params["date_from"] = date_from

        if date_to:
            params["date_to"] = date_to
        
        try:
            response = await self.client.get("/vacancies", params=params)
            response.raise_for_status()
            data = response.json()
            # Проверка формата ответа
            if not isinstance(data, dict) or "items" not in data:
                logger.error(f"Unexpected response format from HH API: {type(data)}")
                return {"items": [], "found": 0, "pages": 0}
            return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching vacancies from hh.ru: {e.response.status_code} - {e.response.text[:200]}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Request error fetching vacancies from hh.ru: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching vacancies from hh.ru: {e}", exc_info=True)
            raise
    
    async def get_vacancy_details(self, vacancy_id: str) -> Optional[Dict[str, Any]]:
        """Получить детальную информацию о вакансии"""
        try:
            response = await self.client.get(f"/vacancies/{vacancy_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.warning(f"Error fetching vacancy details {vacancy_id}: {e}")
            return None
    
    def extract_skills(self, description: str, requirements: str = "") -> List[str]:
        """
        Извлечение навыков из описания вакансии
        
        Использует простой паттерн-матчинг для поиска технологий
        """
        text = (description + " " + requirements).lower()
        
        # Словарь технологий и их вариаций
        tech_patterns = {
            "python": ["python", "django", "flask", "fastapi", "pandas", "numpy"],
            "javascript": ["javascript", "js", "node.js", "nodejs", "typescript", "ts"],
            "java": ["java", "spring", "hibernate", "maven"],
            "csharp": ["c#", "csharp", ".net", "asp.net"],
            "php": ["php", "laravel", "symfony"],
            "go": ["go", "golang"],
            "rust": ["rust"],
            "react": ["react", "reactjs", "redux"],
            "vue": ["vue", "vue.js", "vuejs"],
            "angular": ["angular"],
            "sql": ["sql", "postgresql", "mysql", "mariadb", "oracle"],
            "mongodb": ["mongodb", "mongo"],
            "redis": ["redis"],
            "docker": ["docker", "dockerfile"],
            "kubernetes": ["kubernetes", "k8s"],
            "aws": ["aws", "amazon web services"],
            "git": ["git", "github", "gitlab"],
            "linux": ["linux", "unix"],
            "html": ["html", "html5"],
            "css": ["css", "css3", "sass", "scss", "less"],
        }
        
        found_skills = []
        for skill, patterns in tech_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    found_skills.append(skill)
                    break  # Не добавлять дубликаты
        
        return list(set(found_skills))  # Убрать дубликаты
    
    def parse_salary(self, salary: Optional[Dict[str, Any]]) -> tuple:
        """Парсинг зарплаты из формата hh.ru"""
        if not salary:
            return None, None, None
        
        salary_from = salary.get("from")
        salary_to = salary.get("to")
        currency = salary.get("currency", "RUR")
        
        return salary_from, salary_to, currency
    
    def normalize_vacancy(self, vacancy_data: Dict[str, Any]) -> Dict[str, Any]:
        """Нормализация данных вакансии для сохранения в БД"""
        try:
            # Безопасное извлечение данных
            vacancy_id = vacancy_data.get("id")
            if not vacancy_id:
                logger.warning(f"Vacancy data missing 'id' field: {vacancy_data.keys()}")
                raise ValueError("Vacancy data missing required 'id' field")
            
            description = vacancy_data.get("description", "")
            snippet = vacancy_data.get("snippet", {})
            requirements = snippet.get("requirement", "") if isinstance(snippet, dict) else ""
            
            # Извлечение навыков
            skills = self.extract_skills(description, requirements)
            
            # Парсинг зарплаты
            salary_from, salary_to, currency = self.parse_salary(vacancy_data.get("salary"))
            
            # Парсинг даты
            published_at = None
            if vacancy_data.get("published_at"):
                try:
                    published_at_str = vacancy_data["published_at"]
                    if isinstance(published_at_str, str):
                        published_at = datetime.fromisoformat(
                            published_at_str.replace("Z", "+00:00")
                        )
                except (ValueError, AttributeError) as e:
                    logger.debug(f"Error parsing published_at: {e}")
            
            # Безопасное извлечение вложенных объектов
            employer = vacancy_data.get("employer", {})
            employer_name = employer.get("name") if isinstance(employer, dict) else None
            
            experience = vacancy_data.get("experience", {})
            experience_id = experience.get("id") if isinstance(experience, dict) else None
            
            employment = vacancy_data.get("employment", {})
            employment_id = employment.get("id") if isinstance(employment, dict) else None
            
            schedule = vacancy_data.get("schedule", {})
            schedule_id = schedule.get("id") if isinstance(schedule, dict) else None
            
            area = vacancy_data.get("area", {})
            area_name = area.get("name") if isinstance(area, dict) else None
            
            return {
                "hh_id": str(vacancy_id),
                "name": vacancy_data.get("name", ""),
                "description": description,
                "employer_name": employer_name,
                "salary_from": salary_from,
                "salary_to": salary_to,
                "currency": currency,
                "experience": experience_id,
                "employment": employment_id,
                "schedule": schedule_id,
                "area": area_name,
                "skills": skills,
                "requirements": requirements or description,
                "url": vacancy_data.get("alternate_url", ""),
                "published_at": published_at,
            }
        except Exception as e:
            logger.error(f"Error normalizing vacancy data: {e}", exc_info=True)
            logger.debug(f"Vacancy data: {vacancy_data}")
            raise
    
    async def fetch_and_normalize_vacancies(
        self,
        query: str,
        area: Optional[str] = None,
        experience: Optional[str] = None,
        limit: int = 100,
        *,
        employment: Optional[str] = None,
        schedule: Optional[str] = None,
        only_with_salary: bool = False,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Получить и нормализовать вакансии
        
        Returns:
            Список нормализованных вакансий
        """
        all_vacancies = []
        page = 0
        per_page = 100
        
        while len(all_vacancies) < limit:
            result = await self.search_vacancies(
                query=query,
                area=area,
                experience=experience,
                per_page=per_page,
                page=page,
                employment=employment,
                schedule=schedule,
                only_with_salary=only_with_salary,
                date_from=date_from,
                date_to=date_to,
            )
            
            items = result.get("items", [])
            if not items:
                break
            
            # Получить детали для каждой вакансии (опционально, можно использовать snippet)
            for item in items:
                if len(all_vacancies) >= limit:
                    break
                
                try:
                    # Используем данные из списка, можно дополнительно запросить детали
                    normalized = self.normalize_vacancy(item)
                    all_vacancies.append(normalized)
                except Exception as e:
                    logger.warning(f"Error normalizing vacancy item: {e}, skipping...")
                    continue  # Пропускаем проблемную вакансию и продолжаем
            
            # Проверка, есть ли еще страницы
            pages = result.get("pages", 0)
            if page >= pages - 1:
                break
            
            page += 1
        
        return all_vacancies[:limit]
    
    async def close(self):
        """Закрыть HTTP клиент"""
        await self.client.aclose()

