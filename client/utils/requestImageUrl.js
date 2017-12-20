/**
 * transforms image url with width and height parameters
 *
 * @param {String} url
 * @param {Object} options
 *
 * @returns {String} new image url
 */
export default (url, options) => {
  if (!options) {
    return url;
  }
  const base = CLOUDINARY_IMG_URL_STUB;
  const tail = url.split(base)[1];
  let transformation = '';
  if (options.width) {
    // tail = `w_${options.width}/${tail}`;
    transformation += `w_${options.width},`;
  }
  if (options.height) {
    // tail = `h_${options.height}/${tail}`;
    transformation += `h_${options.height},`;
  }
  if (options.fill) {
    transformation += 'c_fill,';
  }
  return `${base}${transformation}/${tail}`;
};
