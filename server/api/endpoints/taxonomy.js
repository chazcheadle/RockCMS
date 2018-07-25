/**
 * Taxonomy retrieval endpoint.
 *
 * This module retrieves a specified taxonomy and caches the results.
 */
import Express from 'express';
import redis from 'redis';
import api from '../api';

const client = redis.createClient();
require('dotenv').config();

const {
  API_GRAPHQL_RESULT_MAX,
  CACHE_TAXONOMY_MAX_AGE,
} = process.env;

const router = new Express.Router();

// Retrieve a single term by 'id'.
router.get('/taxonomy/term/:id?', async (req, res) => {
  const id = (req.params.id) ? req.params.id : null;

  if (id) {
    let data = [];

    const term = await api(
      {
        op: 'getTaxonomyTerm',
        id,
      },
    );
    // Populate the data array with results.
    if (term.data.taxonomy !== null) {
      data = term.data.taxonomy;
      res.send({ data });
    } else {
      res.send('No term found.');
    }
  } else {
    res.send('No term specified.');
  }
});

// Retrieve complete taxonomy for the specified 'taxonomyType'.
router.get('/taxonomy/:taxonomyType', async (req, res) => {
  const publisher = req.query.publisher ? req.query.publisher : 'nbcnews';
  const taxonomyType = (typeof req.params.taxonomyType !== 'undefined') ? req.params.taxonomyType : undefined;
  const size = parseInt(req.query.size, 10) ? req.query.size : API_GRAPHQL_RESULT_MAX;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  let page = 1;
  let data = [];

  // Main function to retrieve taxonomy.
  async function retrieveTaxonomy() {
    const taxonomy = await api(
      {
        op: 'getTaxonomy',
        filters:
          {
            publisher,
            taxonomyType,
          },
        page,
        size,
      },
    );
    // Populate the data array with results.
    if (taxonomy.data.search.items.length > 0) {
      data = [...data, taxonomy.data.search.items];
    }
    // Increment the page number and recursively continue fetching results.
    if (taxonomy.data.search.pagination.page < taxonomy.data.search.pagination.totalPages) {
      page += 1;
      retrieveTaxonomy();
    }
  }

  // Check for taxonomy in Redis cache
  client.get(`taxonomy.${taxonomyType}`, async (error, results) => {
    if (results) {
      data = JSON.parse(results);
      res.send({ data });
    } else {
      await retrieveTaxonomy();
      client.setex(`taxonomy.${taxonomyType}`, CACHE_TAXONOMY_MAX_AGE, JSON.stringify(data));
      res.send({ data });
    }
  });
});

module.exports = router;
