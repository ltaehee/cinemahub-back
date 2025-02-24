const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../utils/s3.util");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3_BUCKET_NAME } = require("../../consts/app");
const getPresignedUrl = require("express").Router();

getPresignedUrl.get("/presigned-url", async (req, res) => {
  const { filename, fileType } = req.query;

  if (!filename || !fileType) {
    return res.status(400).json({ error: "파일 이름이 필요합니다." });
  }

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `images/${filename}`,
    ContentType: fileType,
    ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 1분 유효

    console.log("dsadsa", url);

    return res.json({ url });
  } catch (error) {
    console.error("Presigned URL 생성 오류:", error);
    res.status(500).json({ error: "Presigned URL 생성에 실패했습니다." });
  }
});

module.exports = getPresignedUrl;
