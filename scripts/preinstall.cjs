const fs = require("fs");
const path = require("path");

["package-lock.json", "yarn.lock"].forEach((file) => {
  try {
    fs.unlinkSync(path.join(__dirname, "..", file));
  } catch (error) {
    // ignore if file does not exist
  }
});
