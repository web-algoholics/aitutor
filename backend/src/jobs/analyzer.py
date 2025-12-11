"""
Сервис для анализа вакансий и генерации рекомендаций
"""
from typing import List, Dict, Any, Optional, Set
from collections import Counter
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from .models import JobVacancy, JobAnalysis
from .hh_parser import HHParser

try:
    from courses.models import Course
except ImportError:
    # Если модуль courses не настроен, создаем заглушку
    Course = None

class JobAnalyzer:
    """Анализатор вакансий"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.parser = HHParser()
        self._available_courses: Optional[Set[str]] = None
    
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
                "skill_gaps": [],
                "top_skills": [],
                "skill_combinations": []
            }
        
        # Сохранить вакансии в БД (опционально, можно кэшировать)
        # await self._save_vacancies(vacancies_data)
        
        # Анализ технологий
        all_skills = []
        for vacancy in vacancies_data:
            all_skills.extend(vacancy.get("skills", []))
        
        skill_counter = Counter(all_skills)
        total = len(vacancies_data)
        
        # Получить список доступных курсов
        await self._load_available_courses()
        
        # Категоризация навыков
        technologies = await self._categorize_skills(skill_counter, "technologies")
        frameworks = await self._categorize_skills(skill_counter, "frameworks")
        databases = await self._categorize_skills(skill_counter, "databases")
        tools = await self._categorize_skills(skill_counter, "tools")
        
        # Статистика зарплат
        salary_stats = self._analyze_salaries(vacancies_data)
        
        # Распределение по опыту
        experience_dist = self._analyze_experience(vacancies_data)
        
        # Рекомендации курсов
        recommended_courses = self._recommend_courses(technologies, frameworks)
        
        # Навыки, которых не хватает (можно расширить логику)
        skill_gaps = self._identify_skill_gaps(technologies, frameworks, databases)
        
        # Дополнительная аналитика (после загрузки курсов)
        top_skills = self._get_top_skills(technologies, frameworks, databases, tools)
        skill_combinations = self._analyze_skill_combinations(vacancies_data)
        
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
            "skill_gaps": skill_gaps,
            "top_skills": top_skills,
            "skill_combinations": skill_combinations
        }
    
    async def _load_available_courses(self):
        """Загрузить список доступных курсов из БД"""
        if self._available_courses is None:
            if Course is None:
                # Если модель Course не импортирована, используем пустой набор
                self._available_courses = set()
                return
            
            try:
                result = await self.session.exec(
                    select(Course.slug).where(Course.is_active == True)
                )
                slugs = result.all()
                self._available_courses = set(slugs) if slugs else set()
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"Loaded {len(self._available_courses)} available courses: {self._available_courses}")
            except Exception as e:
                # Если таблица курсов не существует или произошла ошибка,
                # просто используем пустой набор - ссылки на курсы не будут показываться
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Could not load courses: {e}. Continuing without course links.")
                self._available_courses = set()
    
    def _get_course_url(self, skill: str) -> Optional[str]:
        """Получить URL курса для навыка, если курс существует"""
        if not self._available_courses:
            return None
        
        # Нормализация названия навыка для поиска курса
        skill_lower = skill.lower().strip()
        
        # Прямое совпадение
        if skill_lower in self._available_courses:
            url = f"/courses/{skill_lower}"
            import logging
            logger = logging.getLogger(__name__)
            logger.debug(f"Found course URL for skill '{skill}': {url}")
            return url
        
        # Маппинг для случаев, когда название навыка отличается от slug курса
        skill_mapping = {
            "csharp": "c-sharp",
            "c#": "c-sharp",
            "postgresql": "postgres",
            "mongodb": "mongo",
        }
        
        mapped_skill = skill_mapping.get(skill_lower)
        if mapped_skill and mapped_skill in self._available_courses:
            url = f"/courses/{mapped_skill}"
            import logging
            logger = logging.getLogger(__name__)
            logger.debug(f"Found course URL for skill '{skill}' (mapped to '{mapped_skill}'): {url}")
            return url
        
        return None
    
    async def _categorize_skills(
        self,
        skill_counter: Counter,
        category: str
    ) -> List[Dict[str, Any]]:
        """Категоризация навыков с добавлением ссылок на курсы"""
        categories = {
            "technologies": ["python", "javascript", "java", "csharp", "php", "go", "rust", "sql", "typescript"],
            "frameworks": ["react", "vue", "angular", "django", "flask", "spring", "nextjs", "nuxt"],
            "databases": ["sql", "mongodb", "redis", "postgresql", "mysql", "postgres"],
            "tools": ["docker", "kubernetes", "git", "linux", "aws", "gcp", "azure"]
        }
        
        category_skills = categories.get(category, [])
        total = sum(skill_counter.values())
        
        results = []
        for skill in category_skills:
            count = skill_counter.get(skill, 0)
            if count > 0:
                course_url = self._get_course_url(skill)
                result_item = {
                    "skill": skill,
                    "demand_count": count,
                    "percentage": round((count / total) * 100, 2) if total > 0 else 0,
                    "trend": "stable"  # Можно добавить логику определения тренда
                }
                if course_url:
                    result_item["course_url"] = course_url
                
                results.append(result_item)
        
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
    
    def _get_top_skills(
        self,
        technologies: List[Dict[str, Any]],
        frameworks: List[Dict[str, Any]],
        databases: List[Dict[str, Any]],
        tools: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Получить топ навыков из всех категорий"""
        all_skills = []
        all_skills.extend(technologies[:5])
        all_skills.extend(frameworks[:3])
        all_skills.extend(databases[:3])
        all_skills.extend(tools[:3])
        
        # Убрать дубликаты по названию навыка, оставляя тот, у которого больше demand_count
        skills_dict = {}
        for skill in all_skills:
            skill_name = skill["skill"].lower()
            if skill_name not in skills_dict:
                skills_dict[skill_name] = skill
            else:
                # Если уже есть, берем тот, у которого больше demand_count
                if skill["demand_count"] > skills_dict[skill_name]["demand_count"]:
                    skills_dict[skill_name] = skill
        
        # Преобразовать обратно в список
        unique_skills = list(skills_dict.values())
        
        # Добавить ссылки на курсы для топ навыков
        for skill in unique_skills:
            # Всегда проверяем и добавляем course_url
            course_url = self._get_course_url(skill["skill"])
            if course_url:
                skill["course_url"] = course_url
            elif "course_url" in skill:
                # Если курс не найден, удаляем старый course_url
                del skill["course_url"]
        
        # Сортировка по популярности
        unique_skills.sort(key=lambda x: x["demand_count"], reverse=True)
        return unique_skills[:10]
    
    def _analyze_skill_combinations(self, vacancies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Анализ популярных комбинаций навыков"""
        combinations = []
        for vacancy in vacancies[:50]:  # Анализируем первые 50 для производительности
            skills = vacancy.get("skills", [])
            if len(skills) >= 2:
                # Берем топ-3 навыка из вакансии
                top_skills = sorted(skills, key=lambda x: skills.count(x), reverse=True)[:3]
                if len(top_skills) >= 2:
                    combo = tuple(sorted(top_skills[:2]))
                    combinations.append(combo)
        
        # Подсчет популярных комбинаций
        from collections import Counter
        combo_counter = Counter(combinations)
        
        # Возвращаем топ-5 комбинаций
        top_combos = combo_counter.most_common(5)
        return [
            {
                "skills": list(combo),
                "count": count,
                "percentage": round((count / len(vacancies)) * 100, 2) if vacancies else 0
            }
            for combo, count in top_combos
        ]
    
    async def close(self):
        """Закрыть парсер"""
        await self.parser.close()

