const User = require("../../schemas/user/user.schema");
const { findUserByEmail } = require("./profile.service");

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

  await User.updateOne(
    { email },
    {
      $addToSet: {
        favorites: {
          favoriteType,
          favoriteId,
        },
      },
    }
  );

  return { message: "즐겨찾기 추가 성공" };
};

// 즐겨찾기 삭제
const removeFavorite = async (email, favoriteType, favoriteId) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  await User.updateOne(
    { email },
    {
      $pull: {
        favorites: {
          favoriteType,
          favoriteId,
        },
      },
    }
  );

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

module.exports = {
  addFavorite,
  removeFavorite,
  checkFavorite,
};
