/**
 * Cleans and formats an error message for better readability.
 * @param {string} errorMessage - The error message to be cleaned.
 * @returns {string} The cleaned error message.
 */
const cleanErrorMessage = (errorMessage) => {
  if (!errorMessage) return "";
  const cleanedMessage = errorMessage.replace(/[",']/g, "");
  let newCleanedMessage = cleanedMessage.replace(/_/g, " ");

  if (newCleanedMessage.endsWith(" id")) {
    return newCleanedMessage.slice(0, -3) + ".";
  }
  return newCleanedMessage + ".";
};

export default cleanErrorMessage;
