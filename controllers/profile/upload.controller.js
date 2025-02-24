const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../utils/s3.util");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const getPresignedUrl = require("express").Router();

getPresignedUrl.get("/presigned-url", async (req, res) => {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "파일 이름이 필요합니다." });
  }

  /* const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `profile-images/${filename}`,
    ContentType: "image/jpeg", // 필요시 'image/png' 등으로 변경 가능
  };

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1분 유효

    res.json({ url });
  } catch (error) {
    console.error("Presigned URL 생성 오류:", error);
    res.status(500).json({ error: "Presigned URL 생성에 실패했습니다." });
  } */
});

module.exports = getPresignedUrl;
