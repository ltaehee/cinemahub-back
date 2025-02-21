// controllers/favorites.controller.js
const express = require("express");
const {
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require("../../services/profile/favorites.service");
const favoritesController = express.Router();

// 즐겨찾기 추가
favoritesController.post("/add", async (req, res) => {
  try {
    const email = req.session.user.email;
    const { favoriteType, favoriteId } = req.body;

    if (!email) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const result = await addFavorite(email, favoriteType, favoriteId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("즐겨찾기 추가 오류:", error);
    return res.status(500).json({ message: error.message });
  }
});

// 즐겨찾기 삭제
favoritesController.post("/remove", async (req, res) => {
  try {
    const email = req.session.user.email;
    const { favoriteType, favoriteId } = req.body;

    if (!email) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const result = await removeFavorite(email, favoriteType, favoriteId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("즐겨찾기 삭제 오류:", error);
    return res.status(500).json({ message: error.message });
  }
});

// 즐겨찾기 상태 확인
favoritesController.get("/check", async (req, res) => {
  try {
    const email = req.session.user.email;
    const { favoriteType, favoriteId } = req.query;

    if (!email) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const result = await checkFavorite(email, favoriteType, favoriteId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("즐겨찾기 상태 확인 오류:", error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = favoritesController;
