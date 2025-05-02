const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

router.get("/", userController.getNonAdminUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/bulk", upload.single("file"), userController.bulkCreateUsers);
router.get("/role-province/:provinceId", userController.getUsersByRoleAndProvince);

module.exports = router;