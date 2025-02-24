const User = require("../../schemas/user/user.schema");
const { findUserByEmail } = require("./profile.service");
const { tmdbApi } = require("../tmdbApi");

// 즐겨찾기 추가
const addFavorite = async (email, favoriteType, favoriteId) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  // 이미 즐겨찾기 한 경우 예외 처리
  const isFavorite = user.favorites.some(
    (fav) =>
      fav.favoriteType === favoriteType &&
      fav.favoriteId.toString() === favoriteId
  );
  if (isFavorite) throw new Error("이미 즐겨찾기한 항목입니다.");

  // 중복 확인 후  push()
  user.favorites.push({ favoriteType, favoriteId });
  await user.save();

  return { message: "즐겨찾기 추가 성공" };
};

// 즐겨찾기 삭제
const removeFavorite = async (email, favoriteType, favoriteId) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  user.favorites = user.favorites.filter(
    (fav) =>
      !(
        fav.favoriteType === favoriteType &&
        fav.favoriteId.toString() === favoriteId
      )
  );
  await user.save();

  return { message: "즐겨찾기 삭제 성공" };
};

// 즐겨찾기 상태 확인
const checkFavorite = async (email, favoriteType, favoriteId) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  const isFavorite = user.favorites.some(
    (fav) =>
      fav.favoriteType === favoriteType &&
      fav.favoriteId.toString() === favoriteId
  );

  return { isFavorite };
};

/* 영화인 즐겨찾기 api 호출 */
const getFavoritePersons = async (personIds) => {
  try {
    const favoritePersons = await Promise.all(
      personIds.map(async (personId) => {
        const response = await tmdbApi.get(`/person/${personId}`, {
          params: {
            language: "ko-KR",
          },
        });
        const { id, name, profile_path } = response.data;

        return {
          personId: id,
          name,
          profilePath: profile_path,
        };
      })
    );

    return favoritePersons;
  } catch (err) {
    console.error("TMDB API 호출 오류:", err);
    throw new Error("즐겨찾기 인물 정보 호출 실패");
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  checkFavorite,
  getFavoritePersons,
};
