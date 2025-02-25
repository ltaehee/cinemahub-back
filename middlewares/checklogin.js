const checklogin = (req, res, next) => {
  if (!req.session.loginState) {
    return res.status(401).json({
      result: false,
      message:
        '해당 기능은 로그인 후에 이용이 가능합니다. 로그인을 먼저 진행해주세요.',
    });
  }
  next();
};

module.exports = checklogin;
