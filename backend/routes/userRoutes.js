const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");
const { sql, poolConnect } = require('../db'); // <-- Dòng này thay thế dbConfig

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/province/:provinceId", userController.getUsersByProvince);

router.post("/", userController.createUser);
router.post("/export", userController.exportUsers);
router.post("/import", upload.single("file"), userController.importUsers);
router.post("/login", userController.userLogin)
router.post("/logout", userController.logout)

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

module.exports = router;
