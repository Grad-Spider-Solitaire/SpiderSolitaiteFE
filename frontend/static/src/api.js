import {url} from "./constants.js";

export const getUser = (jwt) => {
  const token = localStorage.getItem('idToken');
  return fetch(`${url}users/getUser/${ jwt?.email}`, {headers: {Authorization: `Bearer ${token}`}}).then(response => {
    if (!response.ok) return createUser(jwt);
    return response.json();
  });
}

const createUser = (jwt) => {
  const token = localStorage.getItem('idToken');
  return fetch(`${url}users/createUser`, {
    method: 'POST',
    body: JSON.stringify(
    {
      username: jwt?.name,
      email: jwt?.email,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  })
    .then(response => response.json());
}

export const getHighScores = (difficulty) => {
  const token = localStorage.getItem('idToken');
  return fetch(`${url}gameResults/topscores/${difficulty}`, {headers: {Authorization: `Bearer ${token}`}}).then(response => response.json());
}

export const postScore = (score, time, userId, difficulty) => {
  const token = localStorage.getItem('idToken');
  return fetch(`${url}gameResults/createGameResult`, {method: 'POST', body: JSON.stringify(
    {
      user_id: userId,
      score,
      game_duration: time,
      difficulty_level_id: difficulty,
    }),
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }})
    .then(response => response.json());
}

export const getDifficulty =  (numSuits) => {
  const token = localStorage.getItem('idToken');
  return fetch(`${url}difficulty/${numSuits}`, {headers: {Authorization: `Bearer ${token}`}})
    .then(response => response.json());
}
