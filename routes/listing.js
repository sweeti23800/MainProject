const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIn,

  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing),
);

// search route
router.get(
  "/search",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { country } = req.query;

    if (!country) {
      return res.redirect("/listings");
    }

    let allListings = await Listing.find({
      country: { $regex: country, $options: "i" },
    });

    res.render("listings/index", { allListings });
  }),
);


// GET listings by category
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const listings = await Listing.find({ category });

    // EJS template render karo
    res.render("listings/index", { allListings: listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing),
);

module.exports = router;
