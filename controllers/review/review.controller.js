const checklogin = require('../../middlewares/checklogin');
const emptyChecker = require('../../utils/emptyChecker');

const reviewController = require('express').Router();

reviewController.post('/register', checklogin, (req, res) => {
  const { movieId, image, content, starpoint } = req.body;
  const email = req.session.user;

  if (emptyChecker({ movieId, image, content, starpoint })) {
    return res
      .status(400)
      .json({ result: false, message: '리뷰 내용 작성과 별점을 등록해주세요' });
  }

  if (!email) {
    return res.status(401).json({
      result: false,
      message: '로그인 유지 시간이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }

  console.log(movieId, image, content, starpoint);

  try {
    return res.json({ result: true, data: {}, message: '' });
  } catch (e) {}
});

module.exports = reviewController;
