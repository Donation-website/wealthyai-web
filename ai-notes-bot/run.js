import { postNote } from "./post.js";

postNote()
  .then(() => console.log("AI note cycle checked."))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
