const PersonDetailsCache = require("../../schemas/person/personDetailsCache.schema");
const { tmdbApi } = require("../tmdbApi");

const CACHE_TIME = 60 * 60 * 24 * 7;

const fetchPersonDetails = async (personId) => {
  try {
    const cachedPerson = await PersonDetailsCache.findOne({ personId });

    if (cachedPerson) {
      const timeDiff = (Date.now() - cachedPerson.updatedAt) / 1000;

      if (timeDiff < CACHE_TIME) {
        return cachedPerson;
      }
    }

    const detailsResponse = await tmdbApi.get(`/person/${personId}`, {
      params: {
        append_to_response: "images",
      },
    });

    const { data } = detailsResponse;
    const imgPath =
      data.images?.profiles?.map((image) => image.file_path) || [];
    const { birthday, deathday, gender, department } = data;
    const placeOfBirth = data.place_of_birth;

    const personDetails = {
      personId,
      imgPath,
      birthday,
      deathday,
      gender,
      department,
      placeOfBirth,
      updatedAt: new Date(),
    };

    await PersonDetailsCache.findOneAndUpdate({ personId }, personDetails, {
      upsert: true,
      new: true,
    });

    console.log(`MongoDB에 데이터 저장 완료: 인물 ID ${personId}`);

    return personDetails;
  } catch (error) {
    console.error(
      `영화 ID ${personId}의 상세 정보를 가져오는 중 오류 발생:`,
      error.message
    );
    return {};
  }
};

module.exports = { fetchPersonDetails };
