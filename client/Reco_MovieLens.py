import os
import pprint
import tempfile

from typing import Dict, Text

import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow_datasets as tfds
import tensorflow_recommenders as tfrs

# Ratings data.
# ratings = tfds.load('movielens/100k-ratings', split="train")
ratings = pd.read_csv("/ml-100k/ratings.csv", names=["userId", "movieId", "rating", "timestamp"])
ratings = tf.data.Dataset.from_tensor_slices(dict(ratings))
print(ratings)
# Select the basic features.
ratings = ratings.map(lambda x: {
    "movie_id": x["movieId"],
    "user_id": x["userId"]
})
print(ratings)

# Ratings data.
# ratings = tfds.load('movielens/100k-ratings', split="train")
movies = pd.read_csv("/ml-100k/movies.csv", names=["movieId", "title", "genres"])
movies = tf.data.Dataset.from_tensor_slices(dict(movies))
print(movies)

# Select the basic features.
movies = movies.map(lambda x: x["movieId"])

user_ids_vocabulary = tf.keras.layers.experimental.preprocessing.StringLookup(mask_token=None)
user_ids_vocabulary.adapt(ratings.map(lambda x: x["user_id"]))

movie_titles_vocabulary = tf.keras.layers.experimental.preprocessing.StringLookup(mask_token=None)
movie_titles_vocabulary.adapt(movies)

class MovieLensModel(tfrs.Model):
  # We derive from a custom base class to help reduce boilerplate. Under the hood,
  # these are still plain Keras Models.

  def __init__(
      self,
      user_model: tf.keras.Model,
      movie_model: tf.keras.Model,
      task: tfrs.tasks.Retrieval):
    super().__init__()

    # Set up user and movie representations.
    self.user_model = user_model
    self.movie_model = movie_model

    # Set up a retrieval task.
    self.task = task

  def compute_loss(self, features: Dict[Text, tf.Tensor], training=False) -> tf.Tensor:
    # Define how the loss is computed.

    user_embeddings = self.user_model(features["user_id"])
    movie_embeddings = self.movie_model(features["movie_id"])

    return self.task(user_embeddings, movie_embeddings)

# Define user and movie models.
user_model = tf.keras.Sequential([
    user_ids_vocabulary,
    tf.keras.layers.Embedding(user_ids_vocabulary.vocab_size(), 64)
])
movie_model = tf.keras.Sequential([
    movie_titles_vocabulary,
    tf.keras.layers.Embedding(movie_titles_vocabulary.vocab_size(), 64)
])

# Define your objectives.
task = tfrs.tasks.Retrieval(metrics=tfrs.metrics.FactorizedTopK(
    movies.batch(128).map(movie_model)
  )
)

# Create a retrieval model.
model = MovieLensModel(user_model, movie_model, task)
model.compile(optimizer=tf.keras.optimizers.Adagrad(0.5))

# Train for 3 epochs.
model.fit(ratings.batch(4096), epochs=3)

# Use brute-force search to set up retrieval using the trained representations.
index = tfrs.layers.factorized_top_k.BruteForce(model.user_model)
index.index(movies.batch(100).map(model.movie_model), movies)

# Get some recommendations.
_, titles = index(np.array(["42"]))
print(f"Top 3 recommendations for user 42: {titles[0, :3]}")

# Export the query model.
tmpdir = tempfile.mkdtemp()
#mobilenet_save_path = os.path.join(tmpdir, "saved_model_reco_movie_lens/1/")
mobilenet_save_path = "/Users/Administrator/Desktop/DigiPen/Boja/client" + "/saved_model_reco_movie_lens/1/"
print(mobilenet_save_path)

# Save the index.
tf.saved_model.save(index, mobilenet_save_path)

# Load it back; can also be done in TensorFlow Serving.
loaded = tf.saved_model.load(mobilenet_save_path)

# Pass a user id in, get top predicted movie titles back.
scores, titles = loaded(["42"])

print(f"Recommendations: {titles[0][:3]}")