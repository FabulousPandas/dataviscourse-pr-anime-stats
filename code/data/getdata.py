import requests
import json
import secrets

CLIENT_ID = "bf095f8cb3a46df427e555beb47b1259"
CLIENT_SECRET = "06bce3e7e9711441b96a65a30b6bccf0bc9831fbb5e1c8948a8ea648eca79d8f"

def get_new_code_verifier() -> str:
    token = secrets.token_urlsafe(100)
    return token[:128]

if __name__ == "__main__":
    #code_verifier = code_challenge = get_new_code_verifier()
    url = 'https://api.myanimelist.net/v2/anime/10357?fields=rank,mean,alternative_titles'

    response = requests.get(url, headers = {
        'X-MAL-CLIENT-ID': CLIENT_ID
        })

    response.raise_for_status()
    anime = response.json()
    response.close()

    print(anime)