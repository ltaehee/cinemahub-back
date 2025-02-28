const {
  getPopularActors,
} = require("../services/person/fetchPopularActors.service");
const {
  fetchPersonDetails,
} = require("../services/person/personDetailsCache.service");
const {
  fetchPersonDetailsCredits,
} = require("../services/person/personDetailsCredits.service");
const {
  fetchPersonDetailsImages,
} = require("../services/person/personDetailsImages.service");

const personController = require("express").Router();

personController.get("/popular", async (req, res) => {
  const actors = await getPopularActors();
  res.json(actors);
});

personController.get("/:personId", async (req, res) => {
  const { personId } = req.params;

  try {
    const personDetails = await fetchPersonDetails(personId);
    res.json(personDetails);
  } catch (error) {
    console.error(`영화인 상세 정보 요청 에러: ${error.message}`);
    res.status(500).json({ message: "영화인 상세 정보 요청 에러" });
  }
});

personController.get("/:personId/credits", async (req, res) => {
  const { personId } = req.params;
  const { page, limit } = req.query;

  try {
    const credits = await fetchPersonDetailsCredits(personId, page, limit);
    res.json(credits);
  } catch (error) {
    console.error(`영화인 출연작 요청 에러: ${error.message}`);
    res.status(500).json({ message: "영화인 출연작 요청 에러" });
  }
});

personController.get("/:personId/images", async (req, res) => {
  const { personId } = req.params;
  const { page, limit } = req.query;

  try {
    const images = await fetchPersonDetailsImages(personId, page, limit);
    res.json(images);
  } catch (error) {
    console.error(`영화인 이미지 요청 에러: ${error.message}`);
    res.status(500).json({ message: "영화인 이미지 요청 에러" });
  }
});

module.exports = personController;
