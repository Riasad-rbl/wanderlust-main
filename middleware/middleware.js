// module.exports.isLoggedIn = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//       req.flash("error", "You must be logged in first!");
//       return res.redirect("/login");
//     }
//     next();
//   };
  
//   module.exports.isAdmin = (req, res, next) => {
//     if (!req.isAuthenticated() || req.user.role !== "admin") {
//       req.flash("error", "Access denied! Admins only.");
//       return res.redirect("/listings");
//     }
//     next();
//   };
  
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }

  if (req.user.role !== "admin") {
    req.flash("error", "Access denied! Admins only.");
    return res.redirect("/home");
  }

  next();
};
