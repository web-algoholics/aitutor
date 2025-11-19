import requests
import time
import base64

CLIENT_ID = "019a9c5f-f253-76bd-87a3-84ccf1ab8d62"
CLIENT_SECRET = "5dc9f05d-4811-44b6-b7f5-74fb1de5e37b"
AUTH = f"{CLIENT_ID}:{CLIENT_SECRET}"

class GigaChat:
    def __init__(self):
        self.token = None
        self.token_expires = 0

    def fetch_token(self):
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "RqUID": "any-uuid-строка",  # например, random uuid
            "Authorization": "Basic " + base64.b64encode(AUTH.encode()).decode()
        }
        data = {"scope": "GIGACHAT_API_B2B"}
        response = requests.post(
            "https://ngw.devices.sberbank.ru:9443/api/v2/oauth", 
            headers=headers, 
            data=data, 
            verify=False
        )
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
            json=payload
        )
        return response.json()

giga = GigaChat()
