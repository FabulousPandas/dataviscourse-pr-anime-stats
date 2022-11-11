import requests
import json

def get_request(url):
    CLIENT_ID = "bf095f8cb3a46df427e555beb47b1259"
    response = requests.get(url, headers = {
        'X-MAL-CLIENT-ID': CLIENT_ID
        })

    response.raise_for_status()
    anime = response.json()
    response.close()

    return anime

def popular_anime_json(limit):
    url = 'https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=' + str(limit)
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

def gen_json(anime_list):
    season_list = {}
    genre_json = {}
    banned_genres = ["Award Winning"]
    i = 0
    for anime in anime_list:
        # Get the season for this anime
        season = anime["start_season"]["season"].title() + " " + str(anime["start_season"]["year"])
        if season not in season_list:
            season_entry = {}
            season_entry["season"] = ""
            season_entry["genre_counts"] = {}
            season_entry["anime"] = []
            season_list[season] = season_entry
        season_entry = season_list[season]
        season_entry["season"] = season
        genre_list = []
        # Makes a list of all of the genres this anime has
        for genre in anime["genres"]:
            genre = genre["name"]
            if genre not in banned_genres:
                genre_list.append(genre)
        # Creates the anime object and fills it with metadata
        entry = {}
        entry["title"] = anime["title"]
        entry["season"] = season
        entry["genres"] = genre_list
        entry["rating"] = anime["mean"]
        entry["rank"] = anime["rank"]
        entry["popularity"] = anime["popularity"]
        genre_count = season_entry["genre_counts"]
        # Final touches for season and genre JSON objects
        for genre in genre_list:
            if genre in genre_count:
                genre_count[genre] += 1
            else:
                genre_count[genre] = 1
            if genre not in genre_json:
                genre_json[genre] = []
            genre_json[genre].append(entry)
        season_entry["anime"].append(entry)
        i += 1
        if (i % 500 == 0):
            print("Processed " + str(i) + "th anime")

    return json.dumps(season_list, indent=4), json.dumps(genre_json, indent=4)

if __name__ == "__main__":
    popular_anime = popular_anime_json(5000)
    print("Got most popular anime")
    # The popular_anime object just contains the anime ids, we need to get all of the anime metadata
    anime = anime_list(popular_anime)
    seasons, genres = gen_json(anime)
    with open("anime_seasons.json", "w") as outfile:
        outfile.write(seasons)
    print("Generated Season JSON!")
    with open("anime_genres.json", "w") as outfile:
        outfile.write(genres)
    print("Generated genre JSON!")