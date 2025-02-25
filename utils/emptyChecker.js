const emptyChecker = (param) => {
  // [[]] , [{}];
  const objectValues = Object.values({ ...param });

  return (
    objectValues.includes('') ||
    objectValues.includes(0) ||
    objectValues.includes(undefined) ||
    objectValues.includes(null) ||
    objectValues.some(
      (item) => JSON.stringify(item) === '[]' || JSON.stringify(item) === '{}'
    )
  );
};

module.exports = emptyChecker;
