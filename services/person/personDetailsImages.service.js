const PersonDetailsImages = require("../../schemas/person/personDetailsImages.schema");
const { tmdbApi } = require("../tmdbApi");

const CACHE_TIME = 60 * 60 * 24 * 7;

const fetchPersonDetailsImages = async (personId, page, limit) => {
  try {
    limit = Number(limit);
    page = Number(page);

    const skip = page * limit;
    const cachedPerson = await PersonDetailsImages.findOne({ personId });

    if (cachedPerson) {
      const timeDiff =
        (Date.now() - new Date(cachedPerson.updatedAt).getTime()) / 1000;

      if (timeDiff < CACHE_TIME) {
        return {
          images: cachedPerson.imgPath.slice(skip, skip + limit),
          totalCount: cachedPerson.imgPath.length,
        };
      }
    }

    const response = await tmdbApi.get(`/person/${personId}/images`);
    const imgPath =
      response.data.profiles?.map((image) => image.file_path) ?? [];

    await PersonDetailsImages.findOneAndUpdate(
      { personId },
      { imgPath, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return {
      images: imgPath.slice(skip, skip + limit),
      totalCount: imgPath.length,
    };
  } catch (error) {
    console.error(
      `영화인 ID ${personId}의 이미지 데이터를 가져오는 중 오류 발생:`,
      error.message
    );
    return null;
  }
};

module.exports = { fetchPersonDetailsImages };
