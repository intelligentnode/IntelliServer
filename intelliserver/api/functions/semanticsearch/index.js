const express = require('express');
const router = express.Router();
var path = require('path');
const { SemanticSearch, SupportedEmbedModels } = require('intellinode');
const { USE_DEFAULT_KEYS } = require(path.join(global.__basedir, 'config'));

const keys = {
  'openai': process.env.OPENAI_API_KEY,
  'cohere': process.env.COHERE_API_KEY,
}

function getSemanticSearch(req) {
  if (USE_DEFAULT_KEYS && !req.body.api_key) {
    return new SemanticSearch(keys[req.body.provider.toLowerCase()], req.body.provider);
  } else {
    return new SemanticSearch(req.body.api_key, req.body.provider);
  }
}

function getFilteredResults(results, searchArray) {
    return results.map((result) => ({
      index: result.index,
      similarity: result.similarity,
      text: searchArray[result.index]
    }));
}

/**
 * @swagger
 * /semanticsearch/search:
 *   post:
 *     tags:
 *       - Functions
 *     summary: Semantic search using LLM providers like openai and cohere.
 *
 *     security:
 *       - ApiKeyAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - api_key
 *               - provider
 *               - input
 *             properties:
 *               api_key:
 *                 type: string
 *                 description: The api key.
 *               provider:
 *                 type: string
 *                 description: The provider name (e.g. 'openai').
 *               input:
 *                 type: object
 *                 properties:
 *                   pivot_item:
 *                     type: string
 *                     description: The pivot item to compare others against.
 *                   search_array:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Array of strings to compare with the pivot item.
 *                   number_of_matches:
 *                     type: integer
 *                     description: The number of top matches to return.
 *     responses:
 *       200:
 *         description: The best-matched results based on the semantic search.
 *       400:
 *         description: There was a problem with the request.
 */
router.post('/search', async (req, res, next) => {
  try {
    const semanticSearch = getSemanticSearch(req);
    const pivotItem = req.body.input.pivot_item;
    const searchArray = req.body.input.search_array;
    const numberOfMatches = req.body.input.number_of_matches;
    const results = await semanticSearch.getTopMatches(pivotItem, searchArray, numberOfMatches);

    const filteredResults = getFilteredResults(results, searchArray);

    res.json({ status: "OK", results: filteredResults });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

module.exports = router;