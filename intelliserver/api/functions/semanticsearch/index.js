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
  if (USE_DEFAULT_KEYS) {
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