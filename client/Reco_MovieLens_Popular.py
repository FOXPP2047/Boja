import os
import pprint
import tempfile

import pandas as pd
import tensorflow as tf

ml_100_movies = pd.read_csv("ml-100k/movies.csv")
ml_100_ratings = pd.read_csv("ml-100k/ratings.csv") 

target_movies = ml_100_movies
target_ratings = ml_100_ratings
total_users_num = len(ml_100_ratings.groupby('userId'))

movies_pop = target_movies

# calculate ratingCount for each move
result = target_ratings.groupby('movieId').rating.count().to_frame('ratingCount').reset_index()
movies_pop = pd.merge(movies_pop, result, on='movieId')

# remove unpopular movies
seen_per = total_users_num * (1/4)
print(seen_per)
movies_pop = movies_pop.drop(movies_pop[movies_pop.ratingCount < seen_per].index)

# calculate rating for each movie
result = target_ratings.groupby('movieId').rating.sum().to_frame('rating').reset_index()
movies_pop = pd.merge(movies_pop, result, on='movieId')
movies_pop['rating'] = movies_pop['rating'] / movies_pop['ratingCount']

movies_pop = movies_pop.sort_values(by=['rating'], ascending=False)
print(movies_pop)