/* eslint-disable no-undef */
const app = require("./app");

let server = app.listen(process.env.PORT, () => {
  console.log(`Started express server at port ${server.address().port}`);
});
