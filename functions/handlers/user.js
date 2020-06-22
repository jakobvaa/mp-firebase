const { admin, db } = require("../util/admin");

const config = require("../util/config");

var firebase = require("firebase");
firebase.initializeApp(config);

// /signup {email, pass, confirmpass, username}
exports.signup = (req, res) => {
  const newUser = {
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  const defaultImage =
    "https://firebasestorage.googleapis.com/v0/b/meet-peeps.appspot.com/o/Frame%208.png?alt=media&token=a4aaa0ce-25ab-42b7-a5e5-b2eb1f742892";
  // validate signup data

  // Attempt signup user
  let token, userId;
  db.doc(`/users/${req.body.userName}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ userName: "Already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(req.body.email, req.body.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((iDtoken) => {
      token = iDtoken;
      const userCredentials = {
        userName: req.body.userName,
        email: req.body.email,
        createdAt: new Date().toISOString(),
        userId,
        userIcon: defaultImage,
      };
      return db.doc(`/users/${req.body.userName}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "email is already in use" });
      }
      if (err.code === "auth/weak-password") {
        return res
          .status(400)
          .json({ password: "Password must be 6 characters" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};
exports.login = (req, res) => {
  const userCredentials = {
    email: req.body.email,
    password: req.body.password,
  };

  // Validate login data
  firebase
    .auth()
    .signInWithEmailAndPassword(userCredentials.email, userCredentials.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.status(200).json({ token });
    })
    .catch((err) => {
      if (err.code === "auth/invalid-email") {
        return res.status(400).json({ email: "invalid" });
      } else if (err.code === "auth/wrong-password") {
        return res.status(403).json({ password: "is incorrect" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};
