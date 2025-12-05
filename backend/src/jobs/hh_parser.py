"""
Сервис для парсинга вакансий с hh.ru API
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from config import settings

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
        page: int = 0
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
            "only_with_salary": False,
        }
        
        if area:
            params["area"] = area
        
        if experience:
            params["experience"] = experience
        
        try:
            response = await self.client.get("/vacancies", params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching vacancies from hh.ru: {e}")
            return {"items": [], "found": 0, "pages": 0}
    
    async def get_vacancy_details(self, vacancy_id: str) -> Optional[Dict[str, Any]]:
        """Получить детальную информацию о вакансии"""
        try:
            response = await self.client.get(f"/vacancies/{vacancy_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError:
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
        description = vacancy_data.get("description", "")
        requirements = vacancy_data.get("snippet", {}).get("requirement", "")
        
        # Извлечение навыков
        skills = self.extract_skills(description, requirements)
        
        # Парсинг зарплаты
        salary_from, salary_to, currency = self.parse_salary(vacancy_data.get("salary"))
        
        # Парсинг даты
        published_at = None
        if vacancy_data.get("published_at"):
            try:
                published_at = datetime.fromisoformat(
                    vacancy_data["published_at"].replace("Z", "+00:00")
                )
            except:
                pass
        
        return {
            "hh_id": str(vacancy_data["id"]),
            "name": vacancy_data.get("name", ""),
            "description": description,
            "employer_name": vacancy_data.get("employer", {}).get("name"),
            "salary_from": salary_from,
            "salary_to": salary_to,
            "currency": currency,
            "experience": vacancy_data.get("experience", {}).get("id"),
            "employment": vacancy_data.get("employment", {}).get("id"),
            "schedule": vacancy_data.get("schedule", {}).get("id"),
            "area": vacancy_data.get("area", {}).get("name"),
            "skills": skills,
            "requirements": requirements or description,
            "url": vacancy_data.get("alternate_url", ""),
            "published_at": published_at,
        }
    
    async def fetch_and_normalize_vacancies(
        self,
        query: str,
        area: Optional[str] = None,
        experience: Optional[str] = None,
        limit: int = 100
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
                page=page
            )
            
            items = result.get("items", [])
            if not items:
                break
            
            # Получить детали для каждой вакансии (опционально, можно использовать snippet)
            for item in items:
                if len(all_vacancies) >= limit:
                    break
                
                # Используем данные из списка, можно дополнительно запросить детали
                normalized = self.normalize_vacancy(item)
                all_vacancies.append(normalized)
            
            # Проверка, есть ли еще страницы
            pages = result.get("pages", 0)
            if page >= pages - 1:
                break
            
            page += 1
        
        return all_vacancies[:limit]
    
    async def close(self):
        """Закрыть HTTP клиент"""
        await self.client.aclose()

