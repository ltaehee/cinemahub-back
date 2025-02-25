const searchController = require("express").Router();
const { findMovieByKeyword } = require("../../services/movie/movie.service");
const {
  findPeopleByName,
} = require("../../services/person/searchActorCache.service");
const {
  findUserNicknameByKeyword,
} = require("../../services/user/user.service");

// 배우, 감독정보 api 호출로 가져오기
searchController.get("/people", async (req, res) => {
  const { name, page = 1 } = req.query;

  if (!name) {
    return res.status(400).json({ error: "배우 이름을 입력하세요" });
  }

  try {
    const result = await findPeopleByName(name, Number(page));
    return res.json(result);
  } catch (err) {
    res.status(500).json({ err: "배우,감독 정보 조회 실패" });
  }
});

// 영화정보 db 검색으로 가져오기
searchController.get("/movie", async (req, res) => {
  const { keyword, page = 1, limit = 16 } = req.query;
  console.log("keyword: ", keyword);

  if (!keyword) {
    return res.status(400).json({ error: "검색어를 입력하세요" });
  }

  try {
    const { movies, totalCount } = await findMovieByKeyword(
      keyword,
      Number(page),
      Number(limit)
    );

    if (movies.length === 0) {
      return res.status(404).json({ error: "검색된 영화가 없습니다." });
    }

    return res.json({ movies, totalCount });
  } catch (err) {
    res.status(500).json({ err: "서버 오류" });
  }
});

// 유저정보 검색
searchController.get("/user", async (req, res) => {
  const { keyword } = req.query;
  console.log("nickname: ", keyword);

  if (!keyword) {
    return res.status(400).json({ error: "검색어를 입력하세요" });
  }

  try {
    const user = await findUserNicknameByKeyword(keyword);

    if (!user) {
      return res.status(404).json({ error: "유저를 찾을 수 없습니다." });
    }

    const madeUser = user.map((prev) => ({
      email: prev.email,
      nickname: prev.nickname,
      createdAt: prev.createdAt,
    }));

    return res.json(madeUser);
  } catch (err) {
    res.status(500).json({ err: "유저 정보 조회 실패" });
  }
});
module.exports = searchController;
