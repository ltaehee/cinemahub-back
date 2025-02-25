const {
  deleteUserByEmail,
  deleteUsersByEmails,
  getUsers,
} = require("../../services/user/user.service");

const adminController = require("express").Router();

adminController.delete("/users", async (req, res) => {
  const { emails } = req.query;
  console.log("emails: ", emails);

  const emailArray = typeof emails === "string" ? emails.split(",") : emails;
  console.log("emailArray: ", emailArray);
  if (!emailArray || emailArray.length === 0) {
    return res
      .status(400)
      .json({ message: "삭제할 유저 이메일을 제공하세요." });
  }

  try {
    if (emailArray.length === 1) {
      await deleteUserByEmail(emailArray[0]);
    } else {
      await deleteUsersByEmails(emailArray);
    }

    res.json({ message: "유저 삭제 처리 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

adminController.get("/users", async (req, res) => {
  const { page, limit } = req.query;

  try {
    const result = await getUsers(page, limit);
    return res.json(result);
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
module.exports = adminController;
