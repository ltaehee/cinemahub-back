require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB 연결 성공!"))
  .catch((err) => console.log("❌ MongoDB 연결 실패:", err));

// 간단한 Schema 정의
const testSchema = new mongoose.Schema({ message: String });
const Test = mongoose.model("Test", testSchema);

// DB에 데이터 저장
const saveTestData = async () => {
  try {
    const testDoc = new Test({ message: "MongoDB 자동 생성 테스트" });
    await testDoc.save();
    console.log("✅ 테스트 데이터 저장 성공!");
    mongoose.connection.close(); // 저장 후 DB 연결 종료
  } catch (err) {
    console.log("❌ 데이터 저장 실패:", err);
  }
};

// 실행
saveTestData();
