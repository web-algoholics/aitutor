import requests
import time
import base64
import uuid

CLIENT_ID = "019a3eb7-2b8b-7059-8eec-8b38d23f53aa"
CLIENT_SECRET = "31329df0-471d-48ce-b319-b0106b4d00d8"
AUTH = f"{CLIENT_ID}:{CLIENT_SECRET}"

class GigaChat:
    def __init__(self):
        self.token = None
        self.token_expires = 0

    def fetch_token(self):
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "RqUID": str(uuid.uuid4()),
            "Authorization": "Basic " + base64.b64encode(AUTH.encode()).decode(),
        }
        data = {"scope": "GIGACHAT_API_PERS"}
        # Получаем OAuth‑токен, а не делаем чат‑запрос
        response = requests.post(
            "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
            headers=headers,
            data=data,
            verify=False,
        )
        if response.status_code != 200:
            raise Exception(f"Ошибка получения токена: {response.status_code} - {response.text}")
        resp_json = response.json()
        self.token = resp_json["access_token"]
        self.token_expires = time.time() + resp_json.get("expires_in", 3600) - 120

    def get_token(self):
        if not self.token or time.time() > self.token_expires:
            self.fetch_token()
        return self.token

    def ask(self, question):
        token = self.get_token()
        payload = {
            "model": "GigaChat",
            "messages": [{"role": "user", "content": question}]
        }
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        response = requests.post(
            "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
            headers=headers,
            json=payload,
            verify=False,  # Отключаем проверку сертификата (для тестов / self-signed)
        )
        if response.status_code != 200:
            raise Exception(f"Ошибка GigaChat API: {response.status_code} - {response.text}")
        return response.json()

giga = GigaChat()
