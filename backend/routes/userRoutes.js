const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/province/", userController.getUsersByProvince);

router.post("/", userController.createUser);
router.post("/bulk", upload.single("file"), userController.bulkCreateUsers);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

module.exports = router;