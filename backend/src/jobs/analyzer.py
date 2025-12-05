"""
Сервис для анализа вакансий и генерации рекомендаций
"""
from typing import List, Dict, Any, Optional
from collections import Counter
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from .models import JobVacancy, JobAnalysis
from .hh_parser import HHParser

class JobAnalyzer:
    """Анализатор вакансий"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.parser = HHParser()
    
    async def analyze_market(
        self,
        query: str,
        area: Optional[str] = None,
        experience: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Полный анализ рынка вакансий
        
        Returns:
            Словарь с результатами анализа
        """
        # Получить вакансии
        vacancies_data = await self.parser.fetch_and_normalize_vacancies(
            query=query,
            area=area,
            experience=experience,
            limit=limit
        )
        
        if not vacancies_data:
            return {
                "query": query,
                "total_vacancies": 0,
                "technologies": [],
                "frameworks": [],
                "databases": [],
                "tools": [],
                "salary_stats": {},
                "experience_distribution": {},
                "recommended_courses": [],
                "skill_gaps": []
            }
        
        # Сохранить вакансии в БД (опционально, можно кэшировать)
        # await self._save_vacancies(vacancies_data)
        
        # Анализ технологий
        all_skills = []
        for vacancy in vacancies_data:
            all_skills.extend(vacancy.get("skills", []))
        
        skill_counter = Counter(all_skills)
        total = len(vacancies_data)
        
        # Категоризация навыков
        technologies = self._categorize_skills(skill_counter, "technologies")
        frameworks = self._categorize_skills(skill_counter, "frameworks")
        databases = self._categorize_skills(skill_counter, "databases")
        tools = self._categorize_skills(skill_counter, "tools")
        
        # Статистика зарплат
        salary_stats = self._analyze_salaries(vacancies_data)
        
        # Распределение по опыту
        experience_dist = self._analyze_experience(vacancies_data)
        
        # Рекомендации курсов
        recommended_courses = self._recommend_courses(technologies, frameworks)
        
        # Навыки, которых не хватает (можно расширить логику)
        skill_gaps = self._identify_skill_gaps(technologies, frameworks, databases)
        
        return {
            "query": query,
            "total_vacancies": total,
            "technologies": technologies,
            "frameworks": frameworks,
            "databases": databases,
            "tools": tools,
            "salary_stats": salary_stats,
            "experience_distribution": experience_dist,
            "recommended_courses": recommended_courses,
            "skill_gaps": skill_gaps
        }
    
    def _categorize_skills(
        self,
        skill_counter: Counter,
        category: str
    ) -> List[Dict[str, Any]]:
        """Категоризация навыков"""
        categories = {
            "technologies": ["python", "javascript", "java", "csharp", "php", "go", "rust", "sql"],
            "frameworks": ["react", "vue", "angular", "django", "flask", "spring"],
            "databases": ["sql", "mongodb", "redis", "postgresql", "mysql"],
            "tools": ["docker", "kubernetes", "git", "linux", "aws"]
        }
        
        category_skills = categories.get(category, [])
        total = sum(skill_counter.values())
        
        results = []
        for skill in category_skills:
            count = skill_counter.get(skill, 0)
            if count > 0:
                results.append({
                    "skill": skill,
                    "demand_count": count,
                    "percentage": round((count / total) * 100, 2) if total > 0 else 0,
                    "trend": "stable"  # Можно добавить логику определения тренда
                })
        
        # Сортировка по популярности
        results.sort(key=lambda x: x["demand_count"], reverse=True)
        return results
    
    def _analyze_salaries(self, vacancies: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Анализ зарплат"""
        salaries_from = []
        salaries_to = []
        
        for vacancy in vacancies:
            salary_from = vacancy.get("salary_from")
            salary_to = vacancy.get("salary_to")
            
            if salary_from:
                salaries_from.append(salary_from)
            if salary_to:
                salaries_to.append(salary_to)
        
        stats = {}
        if salaries_from:
            stats["average_from"] = sum(salaries_from) / len(salaries_from)
            stats["min_from"] = min(salaries_from)
            stats["max_from"] = max(salaries_from)
        
        if salaries_to:
            stats["average_to"] = sum(salaries_to) / len(salaries_to)
            stats["min_to"] = min(salaries_to)
            stats["max_to"] = max(salaries_to)
        
        if salaries_from and salaries_to:
            stats["average_mid"] = (stats.get("average_from", 0) + stats.get("average_to", 0)) / 2
        
        return stats
    
    def _analyze_experience(self, vacancies: List[Dict[str, Any]]) -> Dict[str, int]:
        """Анализ распределения по опыту"""
        experience_map = {
            "noExperience": "Без опыта",
            "between1And3": "1-3 года",
            "between3And6": "3-6 лет",
            "moreThan6": "Более 6 лет"
        }
        
        exp_counter = Counter()
        for vacancy in vacancies:
            exp = vacancy.get("experience", "unknown")
            exp_counter[experience_map.get(exp, exp)] += 1
        
        return dict(exp_counter)
    
    def _recommend_courses(
        self,
        technologies: List[Dict[str, Any]],
        frameworks: List[Dict[str, Any]]
    ) -> List[str]:
        """Рекомендация курсов на основе анализа"""
        # Маппинг навыков на курсы
        skill_to_course = {
            "python": "Python",
            "javascript": "JavaScript",
            "java": "Java",
            "react": "React",
            "vue": "JavaScript",  # Vue требует JS
            "angular": "TypeScript",
            "django": "Python",
            "flask": "Python",
            "sql": "SQL",
            "go": "Go",
            "rust": "Rust"
        }
        
        recommended = set()
        
        # Топ-3 технологии
        for tech in technologies[:3]:
            course = skill_to_course.get(tech["skill"])
            if course:
                recommended.add(course)
        
        # Топ-2 фреймворка
        for framework in frameworks[:2]:
            course = skill_to_course.get(framework["skill"])
            if course:
                recommended.add(course)
        
        return list(recommended)
    
    def _identify_skill_gaps(
        self,
        technologies: List[Dict[str, Any]],
        frameworks: List[Dict[str, Any]],
        databases: List[Dict[str, Any]]
    ) -> List[str]:
        """Определение пробелов в навыках"""
        # Навыки, которые часто требуются, но редко изучаются
        common_gaps = [
            "Docker",
            "Kubernetes",
            "CI/CD",
            "Testing",
            "System Design"
        ]
        
        # Можно расширить логику, сравнивая с курсами пользователя
        return common_gaps[:3]  # Возвращаем топ-3
    
    async def _save_vacancies(self, vacancies_data: List[Dict[str, Any]]):
        """Сохранить вакансии в БД (опционально, для кэширования)"""
        for vacancy_data in vacancies_data:
            # Проверить, существует ли уже
            result = await self.session.exec(
                select(JobVacancy).where(JobVacancy.hh_id == vacancy_data["hh_id"])
            )
            existing = result.first()
            
            if not existing:
                vacancy = JobVacancy(**vacancy_data)
                self.session.add(vacancy)
        
        await self.session.commit()
    
    async def close(self):
        """Закрыть парсер"""
        await self.parser.close()

