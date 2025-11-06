This is backend for AI Tutor.
To test or develop (without docker):
1. Setup virtual environment
- `python3 -m venv .venv`
- `source .venv/bin/active (on unix)` or `.venv/Scripts/activate (on windows)`
2. Install dependencies to .venv
- `pip install -r requirements.txt`
3. Run the server locally:
- `Get to backend/src directory`
- `uvicorn main:app --reload`
- `Open http://localhost:8000/ in browser`
With docker:
- TODO