const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/province/", userController.getUsersByProvince);

router.post("/", userController.createUser);
router.post("/bulk", upload.single("file"), userController.bulkCreateUsers);
router.post("/login", userController.userLogin)

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

module.exports = router;const express = require('express');
const router = express.Router();
const { sql, poolConnect } = require('../db'); // <-- Dòng này thay thế dbConfig

router.get('/profile/:id', async (req, res) => {
  const ID_user = req.params.id;

  try {
    const pool = await poolConnect;
    const result = await pool
      .request()
      .input('ID_user', sql.UniqueIdentifier, ID_user)
      .query('SELECT * FROM USERS WHERE ID_user = @ID_user');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = result.recordset[0];
    res.json(user);
  } catch (err) {
    console.error('Lỗi khi truy vấn dữ liệu:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' });
  }
});

module.exports = router;
