const express = require('express')
const path = require('path')

// Server Insatance
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbpath = path.join(__dirname, 'moviesData.db')
console.log(dbpath)

let db = null
const initiateServerAndDb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (error) {
    console.log(error.message)
  }
}

initiateServerAndDb()

const reStructuringFUnc = movie => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  }
}

// 1st API -Returns a list of all movie names in the movie table

app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `
    SELECT *
    FROM movie;`

  const dbResponse = await db.all(getAllMoviesQuery)
  response.send(dbResponse.map(each => reStructuringFUnc(each)))
})

// 2nd API -Creates a new movie in the movie table.

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  // finding length of no.of movies
  const getAllMoviesQuery = `
    SELECT *
    FROM movie;`
  const allMovies = await db.all(getAllMoviesQuery)
  const allMoviesArray = allMovies.map(each => reStructuringFUnc(each))
  const lastMovie = allMoviesArray[allMoviesArray.length - 1]
  const lastMovieID = lastMovie.movieId

  // Adding to DB
  const newMovieAdditionQuery = `
  INSERT
  INTO movie(movie_id,director_id,movie_name,lead_actor)
  VALUES(${lastMovieID + 1},${directorId},'${movieName}','${leadActor}');`

  try {
    await db.run(newMovieAdditionQuery)
    response.send('Movie Successfully Added')
  } catch (error) {
    console.log(error.message)
  }
})

// 3rd API -Returns a movie based on the movie ID

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieByIdQuery = `
  SELECT * FROM movie WHERE movie_id=${movieId}`

  const dbResponse = await db.get(getMovieByIdQuery)
  response.send(dbResponse)
})

// 4th API Updates the details of a movie in the movie table based on the movie ID

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updatingQuery = `
  UPDATE movie
  SET
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id=${movieId}`

  await db.run(updatingQuery)
  response.send('Movie Details Updated')
})

//5th API --Deletes a movie from the movie table based on the movie ID

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletionQuery = `
  DELETE FROM movie WHERE movie_id=${movieId}`
  await db.run(deletionQuery)
  response.send('Movie Removed')
})
