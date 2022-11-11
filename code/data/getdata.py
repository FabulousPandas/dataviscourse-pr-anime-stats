import requests
import json

CLIENT_ID = "bf095f8cb3a46df427e555beb47b1259"
CLIENT_SECRET = "06bce3e7e9711441b96a65a30b6bccf0bc9831fbb5e1c8948a8ea648eca79d8f"

def get_request(url):
    response = requests.get(url, headers = {
        'X-MAL-CLIENT-ID': CLIENT_ID
        })

    response.raise_for_status()
    anime = response.json()
    response.close()

    return anime

def popular_anime_json():
    url = 'https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=50'
    return get_request(url)

def anime_list(a_json):
    data = a_json["data"] 
    anime_list = []
    for anime in data:
        anime = anime["node"]
        anime_id = anime["id"]
        url = 'https://api.myanimelist.net/v2/anime/' + str(anime_id) + '?fields=title,genres,start_season,mean,rank,popularity'
        anime_list.append(get_request(url))
    return anime_list

def gen_season_json(anime_list):
    season_list = {}
    banned_genres = ["Award Winning"]
    for anime in anime_list:
        season = anime["start_season"]["season"].title() + " " + str(anime["start_season"]["year"])
        if season not in season_list:
            season_entry = {}
            season_entry["season"] = ""
            season_entry["genre_counts"] = {}
            season_entry["anime"] = []
            season_list[season] = season_entry
        season_entry = season_list[season]
        season_entry["season"] = season
        genre_count = season_entry["genre_counts"]
        genre_list = []
        for genre in anime["genres"]:
            if genre["name"] not in banned_genres:
                genre_list.append(genre["name"])
        for genre in genre_list:
            if genre in genre_count:
                genre_count[genre] += 1
            else:
                genre_count[genre] = 1
        entry = {}
        entry["title"] = anime["title"]
        entry["season"] = season
        entry["genres"] = genre_list
        entry["rating"] = anime["mean"]
        entry["rank"] = anime["rank"]
        entry["popularity"] = anime["popularity"]
        season_entry["anime"].append(entry)
    return season_list

if __name__ == "__main__":
    popular_anime = popular_anime_json()
    print("Got most popular anime")
    anime = anime_list(popular_anime)
    seasons = gen_season_json(anime)
    with open("anime_seasons.json", "w") as outfile:
        outfile.write(json.dumps(seasons, indent=4))
    print("Generated Season JSON!")