const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

router.get("/", userController.getAllUsers);
router.get("/province", userController.getUsersByProvince);
router.get("/check-username", userController.checkUsername);
router.get("/export_filter/", userController.exportFilteredUser);
router.get("/survey", userController.getUserBySurvey);
router.get("/survey/export", userController.exportUsersBySurvey);
router.get("/total-by-member", userController.getTotalUsersByMemberStatus);
router.get("/:id", userController.getUserById);

router.post("/", userController.createUser);
router.post("/export", userController.exportUsers);
router.post("/import", upload.single("file"), userController.importUsers);
router.post("/login", userController.userLogin)
router.post("/logout", userController.logout)

router.put("/:id", userController.updateUser);

router.delete("/bulk", userController.deleteMultipleUsers);
router.delete("/:id", userController.deleteUser);

module.exports = router;
