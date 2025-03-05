const express = require('express');
const router = express.Router();
var path = require('path');
const { SemanticSearch, SupportedEmbedModels, IntellicloudWrapper } = require('intellinode');
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


/**
 * @swagger
 * /search_intellinode:
 *   post:
 *     tags:
 *       - Data
 *     summary: Semantic search using the IntelliNode service.
 *     description: Perform a semantic search to find the most relevant items related to the given query using IntelliNode.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - one_key
 *               - query_text
 *               - k
 *             properties:
 *               one_key:
 *                 type: string
 *                 description: IntelliNode one_key for authentication.
 *               query_text:
 *                 type: string
 *                 description: The query text to search against the items.
 *               k:
 *                 type: integer
 *                 description: The number of top results to return from the search.
 *     responses:
 *       200:
 *         description: The search results containing the most relevant items.
 *       400:
 *         description: An error message if the request is invalid.
 *       500:
 *         description: An error message if there is an issue processing the request.
 */
router.post('/search_intellinode', async (req, res, next) => {
  const oneKey = req.body.one_key || process.env.ONE_KEY;
  const queryText = req.body.query_text;
  const searchK = req.body.k;

  // Check environment variable for custom IntelliBase URL
  const customIntelliBaseEnv = process.env.INTELLIBASE;

  // If the user explicitly passed intelliBase, it overrides
  let intelliBaseUrl = null;
  if (req.body.intelliBase) {
    intelliBaseUrl = req.body.intelliBase;
  } else if (customIntelliBaseEnv) {
    intelliBaseUrl = customIntelliBaseEnv;
  }

  if (!queryText) {
    return res.json({ status: "ERROR", message: "Send the query_text parameter." });
  }
  if (!searchK) {
    return res.json({ status: "ERROR", message: "Send the k parameter for number of searched items." });
  }
  if (!oneKey) {
    return res.json({ status: "ERROR", message: "Send intellinode one_key to use the service." });
  }

  try {
    // Pass oneKey and optional intelliBase
    const intellicloud = new IntellicloudWrapper(oneKey, intelliBaseUrl);
    const result = await intellicloud.semanticSearch(queryText, searchK);
    res.json({ status: "OK", results: result });
  } catch (error) {
    res.json({ status: "ERROR", message: error.message });
  }
});

module.exports = router;