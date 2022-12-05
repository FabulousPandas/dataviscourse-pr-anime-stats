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
        if (pop % 500 == 0 and len(data) - pop > 50):
            print("Requested Anime %d / %d, got rate limited" % (pop, len(data)))
            for count in range(5, 0, -1):
                print("Continuing in " + str(count) + "...")
                time.sleep(60)
            print("Continuing")
    return anime_list

def gen_dict(anime_list):
    year_list = {}
    genre_json = {}
    banned_genres = ["Award Winning"]
    for anime in anime_list:
        try:
            # Get the year for this anime
            year = str(anime["start_season"]["year"])
            if year not in year_list:
                year_entry = {}
                year_entry["year"] = ""
                year_entry["genre_counts"] = {}
                year_entry["anime"] = []
                year_list[year] = year_entry
            year_entry = year_list[year]
            year_entry["year"] = year
            genre_list = []
            # Makes a list of all of the genres this anime has
            for genre in anime["genres"]:
                genre = genre["name"]
                if genre not in banned_genres:
                    genre_list.append(genre)
            # Creates the anime object and fills it with metadata
            entry = {}
            entry["title"] = anime["title"]
            entry["year"] = year
            entry["genres"] = genre_list
            entry["rating"] = anime["mean"]
            entry["rank"] = anime["rank"]
            entry["popularity"] = anime["popularity"]
            genre_count = year_entry["genre_counts"]
            # Final touches for year and genre JSON objects
            for genre in genre_list:
                if genre in genre_count:
                    genre_count[genre] += 1
                else:
                    genre_count[genre] = 1
                if genre not in genre_json:
                    genre_json[genre] = []
                genre_json[genre].append(entry)
            year_entry["anime"].append(entry)
            pop = entry["popularity"]
            if (pop % 500 == 0):
                print("Processed Anime %d / %d into json" % (pop, len(anime_list)))
        except KeyError:
            continue

    return year_list, genre_json

def format_years(years_dict):
    years = []
    for year in years_dict:
        year_arr = []
        year_arr.append(year)
        year_arr.append(years_dict[year])
        years.append(year_arr)
    return years

def format_genres(genre_dict):
    genres = []
    for genre in genre_dict:
        genre_arr = []
        genre_arr.append(genre)
        genre_arr.append(genre_dict[genre])
        genres.append(genre_arr)
    return genres

if __name__ == "__main__":
    popular_anime = popular_anime_json(14000)
    print("Got most popular anime")
    # The popular_anime object just contains the anime ids, we need to get all of the anime metadata
    print("Requesting anime metadata...")
    anime = anime_list(popular_anime)
    print("Got all requests from MAL")
    print("Processing data for json...")
    years, genres = gen_dict(anime)
    years = format_years(years)
    genres = format_genres(genres)
    with open("anime_years.json", "w") as outfile:
        outfile.write(json.dumps(years, indent=4, ensure_ascii=False))
    print("Generated year JSON!")
    with open("anime_genres.json", "w") as outfile:
        outfile.write(json.dumps(genres, indent=4, ensure_ascii=False))
    print("Generated genre JSON!")