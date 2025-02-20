const emptyChecker = (param) => {
  const objectValues = Object.values({ ...param });

  return (
    objectValues.includes('') ||
    objectValues.includes(0) ||
    objectValues.includes(undefined) ||
    objectValues.includes(null)
  );
};

module.exports = emptyChecker;
