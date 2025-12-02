This is backend for AI Tutor.

To test or develop (without docker):
1. Setup virtual environment
- `python3 -m venv .venv`
- `source .venv/bin/activate (on Linux/MacOs)` or `.venv/Scripts/activate (on windows)`
2. Install dependencies to .venv
- `pip install -r requirements.txt`
3. Run the server locally:
- `Fill .env.local.template file and rename it to .env.local`
- Get to `backend/src` directory
- run `uvicorn main:app --reload`
- Open http://localhost:8000/docs in browser to view endpoints
4. 5

With docker:
- TODO