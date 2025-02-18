const { TMDB_SEARCH_API_KEY } = require("../../consts/app");

const searchController = require("express").Router();
const axios = require("axios");

searchController.get("/actor", async (req, res) => {
  //   console.log("req.session: ", req.session.user);
  const { name } = req.query;
  console.log("name: ", name);
  try {
    const searchResponse = await axios.get(
      `https://api.themoviedb.org/3/search/person?api_key=${TMDB_SEARCH_API_KEY}&query=${encodeURIComponent(
        name
      )}&language=ko-KR`
    );

    if (searchResponse.data.results.length === 0) {
      return res.status(404).json({ error: "배우를 찾을 수 없습니다." });
    }
    console.log("searchResponse: ", searchResponse.data);

    return res.json(searchResponse.data.results);

    // const actorId = searchResponse.data.results[0].id; // 첫번째 배우 ID

    // const detailResponse = await axios.get(
    //   `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_SEARCH_API_KEY}&language=ko-KR`
    // );
    // console.log("detailResponse: ", detailResponse.data);
  } catch (err) {
    res.status(500).json({ err: "배우 정보 조회 실패" });
  }
});

module.exports = searchController;
