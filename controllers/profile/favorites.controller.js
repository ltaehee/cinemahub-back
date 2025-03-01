// controllers/favorites.controller.js
const express = require('express');
const {
  addFavorite,
  removeFavorite,
  checkFavorite,
  getFavoritePersons,
} = require('../../services/profile/favorites.service');
const Movie = require('../../schemas/movie/movie.schema');
const {
  findUserByNickname,
} = require('../../services/profile/profile.service');
const favoritesController = express.Router();

// 즐겨찾기 추가
favoritesController.post('/add', async (req, res) => {
  try {
    const email = req.session.user.email;
    const { favoriteType, favoriteId } = req.body;

    if (!email) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const result = await addFavorite(email, favoriteType, favoriteId);
    return res.status(201).json(result);
  } catch (error) {
    console.error('즐겨찾기 추가 오류:', error);
    return res.status(500).json({ message: error.message });
  }
});

// 즐겨찾기 삭제
favoritesController.post('/remove', async (req, res) => {
  try {
    const email = req.session.user.email;
    const { favoriteType, favoriteId } = req.body;

    if (!email) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const result = await removeFavorite(email, favoriteType, favoriteId);
    return res.status(204).json(result);
  } catch (error) {
    console.error('즐겨찾기 삭제 오류:', error);
    return res.status(500).json({ message: error.message });
  }
});

// 즐겨찾기 상태 확인
favoritesController.get('/check', async (req, res) => {
  try {
    const email = req.session.user.email;
    const { favoriteType, favoriteId } = req.query;

    if (!email) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const result = await checkFavorite(email, favoriteType, favoriteId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// 즐겨찾기 영화 조회(페이지네이션)
favoritesController.get('/movies/:nickname', async (req, res) => {
  const { nickname } = req.params;
  const { page, limit } = req.query;
  const offset = (page - 1) * limit;

  try {
    const user = await findUserByNickname(nickname);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // Movie 타입의 favoriteId만 가져오기
    const movieIds = user.favorites
      .filter((fav) => fav.favoriteType === 'Movie')
      .map((fav) => parseInt(fav.favoriteId));

    const favoriteMovies = await Movie.find({ movieId: { $in: movieIds } })
      .skip(offset)
      .limit(limit);

    const total = movieIds.length;

    return res.status(200).json({
      data: favoriteMovies,
      total,
    });
  } catch (error) {
    console.error('즐겨찾기 영화 페이지네이션 오류:', error);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 즐겨찾기 영화인 조회(페이지네이션)
favoritesController.get('/persons/:nickname', async (req, res) => {
  const { nickname } = req.params;
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const offset = (page - 1) * limit;

  try {
    const user = await findUserByNickname(nickname);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // Person 타입의 favoriteId만 가져오기
    const personIds = user.favorites
      .filter((fav) => fav.favoriteType === 'Person')
      .map((fav) => parseInt(fav.favoriteId));

    const paginatedPersonIds = personIds.slice(offset, offset + limit);

    // TMDB API 호출로 Person 정보 가져오기
    const favoritePersons = await getFavoritePersons(paginatedPersonIds);

    const total = personIds.length;

    return res.status(200).json({
      data: favoritePersons,
      total,
    });
  } catch (error) {
    console.error('즐겨찾기 영화인 페이지네이션 오류:', error);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

module.exports = favoritesController;
