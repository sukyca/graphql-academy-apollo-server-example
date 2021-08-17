// Define custom error format
const formatError = (error) => {
  let errorOut = {};

  let parsed = {};
  try {
    parsed = JSON.parse(error.message);
    errorOut = {
      ...parsed,
    };
  } catch (e) {
    errorOut.code = 500;
    errorOut.message = error.message;
  }
  if (process.env.NODE_ENV === 'development-debug') errorOut.location = error.location;
  if (process.env.NODE_ENV === 'development-debug') errorOut.details = error.stack.split('\n');
  errorOut.path = error.path;

  return errorOut;
};

module.exports = {
  formatError,
};
