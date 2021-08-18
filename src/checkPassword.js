// // TODO
// const checkPassword = async () => {
//   const user = await User.findOne({ username });
//   if (!user) {
//     throw new Error("No user found ");
//   }

//   const isValid = await bcrypt.compare(password, user.password);
//   if (!isValid) {
//     throw new Error("Incorrect password ");
//   }

//   const token = await jwt.sign(
//     {
//       user: pick(user, ["_id", "username"]),
//     },
//     SECRET,

//     { expiresIn: "1y" }
//   );
//   return token;
// };

// module.exports = checkPassword;
const checkPassword = async () => {
  const bcrypt = require("bcryptjs");
  const users = require("./users");

  const checkPassword = async (username, password) => {
    let user = users.find((user) => user.username === username);
    if (!user) {
      return "Incorrect credentials!";
    }
    let result = await bcrypt
      .compare(password, user.password)
      .then((isMatch) => {
        if (isMatch) {
          return "Successfully logged in!";
        } else {
          return "Incorrect credentials!";
        }
      })
      .catch((err) => {
        console.log(err);
        return "Something went wrong!";
      });
    return result;
  };

  module.exports = checkPassword;
};

module.exports = checkPassword;
