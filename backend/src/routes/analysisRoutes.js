// backend/src/routes/analysisRoutes.js
const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware'); 

// Rota POST existente para gerar a análise (protegida)
router.post('/analise', protect, analysisController.generateAnalysis);

// NOVA ROTA: Rota para buscar o histórico de análises (protegida)
// URL final: /api/analises/historico
router.get('/analises/historico', protect, analysisController.getAnalysisHistory);

module.exports = router;