const checklogin = (req, res, next) => {
  if (!req.session.loginState) {
    return res.status(401).json({
      result: false,
      message: '로그인 유지 시간이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }
  next();
};

module.exports = checklogin;
