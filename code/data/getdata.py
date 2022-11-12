import requests
import json
import time

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
    top_list = []
    i = 0
    while(limit - 500 > 0):
        limit -= 500
        url = 'https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=500&offset=' + str(i * 500)
        top_list.append(get_request(url))
        i += 1
    url = 'https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=' + str(limit) + '&offset=' + str(i * 500)
    top_list.append(get_request(url))
    
    for i in range(1, len(top_list)):
        for anime in top_list[i]["data"]:
            top_list[0]["data"].append(anime)
    return top_list[0]

def anime_list(a_json):
    data = a_json["data"] 
    anime_list = []
    for anime in data:
        anime = anime["node"]
        anime_id = anime["id"]
        url = 'https://api.myanimelist.net/v2/anime/' + str(anime_id) + '?fields=title,genres,start_season,mean,rank,popularity'
        request = get_request(url)
        anime_list.append(request)
        pop = request["popularity"]
        if (pop % 700 == 0 and len(data) - pop > 50):
            print("Requested Anime %d / %d, got rate limited" % (pop, len(data)))
            for count in range(5, 0, -1):
                print("Continuing in " + str(count) + "...")
                time.sleep(60)
            print("Continuing")
    return anime_list

def gen_dict(anime_list):
    season_list = {}
    genre_json = {}
    banned_genres = ["Award Winning"]
    for anime in anime_list:
        try:
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
            pop = entry["popularity"]
            if (pop % 500 == 0):
                print("Processed Anime %d / %d into json" % (pop, len(anime_list)))
        except KeyError:
            continue

    return season_list, genre_json

def format_seasons(seasons_dict):
    seasons = []
    for season in seasons_dict:
        season_arr = []
        season_arr.append(season)
        season_arr.append(seasons_dict[season])
        seasons.append(season_arr)
    return seasons

def format_genres(genre_dict):
    genres = []
    for genre in genre_dict:
        genre_arr = []
        genre_arr.append(genre)
        genre_arr.append(genre_dict[genre])
        genres.append(genre_arr)
    return genres

if __name__ == "__main__":
    popular_anime = popular_anime_json(2000)
    print("Got most popular anime")
    # The popular_anime object just contains the anime ids, we need to get all of the anime metadata
    print("Requesting anime metadata...")
    anime = anime_list(popular_anime)
    print("Got all requests from MAL")
    print("Processing data for json...")
    seasons, genres = gen_dict(anime)
    seasons = format_seasons(seasons)
    genres = format_genres(genres)
    with open("anime_seasons.json", "w") as outfile:
        outfile.write(json.dumps(seasons, indent=4, ensure_ascii=False))
    print("Generated Season JSON!")
    with open("anime_genres.json", "w") as outfile:
        outfile.write(json.dumps(genres, indent=4, ensure_ascii=False))
    print("Generated genre JSON!")