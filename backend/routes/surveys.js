const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Surveys ORDER BY StartTime DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET /surveys', err);
        res.status(500).send('Database error');
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('Id', id)
            .query('SELECT * FROM Surveys WHERE Id = @Id');
        if (result.recordset.length === 0) return res.status(404).send('Survey not found');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('GET /surveys/:id', err);
        res.status(500).send('Database error');
    }
});

router.post('/', async (req, res) => {
    const { title, description, startTime, endTime, status } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('Title', title)
            .input('Description', description)
            .input('StartTime', startTime)
            .input('EndTime', endTime)
            .input('Status', status)
            .query(`
        INSERT INTO Surveys (Title, Description, StartTime, EndTime, Status)
        OUTPUT INSERTED.*
        VALUES (@Title, @Description, @StartTime, @EndTime, @Status)
      `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('POST /surveys', err);
        res.status(500).send('Database error');
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, startTime, endTime, status } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('Id', id)
            .input('Title', title)
            .input('Description', description)
            .input('StartTime', startTime)
            .input('EndTime', endTime)
            .input('Status', status)
            .query(`
        UPDATE Surveys
        SET Title = @Title, Description = @Description, StartTime = @StartTime, EndTime = @EndTime, Status = @Status
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `);
        if (result.recordset.length === 0) return res.status(404).send('Survey not found');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('PUT /surveys/:id', err);
        res.status(500).send('Database error');
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('Id', id)
            .query('DELETE FROM Surveys WHERE Id = @Id');
        if (result.rowsAffected[0] === 0) return res.status(404).send('Survey not found');
        res.status(204).send();
    } catch (err) {
        console.error('DELETE /surveys/:id', err);
        res.status(500).send('Database error');
    }
});

module.exports = router;