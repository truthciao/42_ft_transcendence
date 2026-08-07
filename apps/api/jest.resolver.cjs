module.exports = (request, options) => {
  if (
    !options.basedir.includes('node_modules') &&
    request.endsWith('.js') &&
    (request.startsWith('./') || request.startsWith('../'))
  ) {
    const tsRequest = request.replace(/\.js$/, '.ts');

    try {
      return options.defaultResolver(tsRequest, options);
    } catch {
      // If there is no corresponding .ts source,
      // fall back to normal Jest resolution.
    }
  }

  return options.defaultResolver(request, options);
};
