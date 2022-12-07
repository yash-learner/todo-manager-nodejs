/* eslint-disable no-undef */
const app = require("./app");

let server = app.listen(3000 || process.env.PORT, () => {
  console.log(`Started express server at port ${server.address().port}`);
});
