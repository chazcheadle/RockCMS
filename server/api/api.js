import fetch from 'node-fetch';
import fs from 'fs';

const { API_ENDPOINT } = process.env;

const query = fs.readFileSync(`${__dirname}/api.graphql`).toString();

async function api(options) {
  const {
    id,
    op,
    size,
    page,
  } = options;

  // Format filter properties.
  // If filters are present iterate through them and construct a 'filters' string.
  let filters = '';
  if (typeof options.filters !== 'undefined') {
    const items = [];
    Object.keys(options.filters).forEach((key) => {
      if (options.filters[key] !== undefined) {
        if (key === 'url') {
          items.push(`${key}:"${options.filters[key]}"`);
        } else {
          items.push(`${key}:${options.filters[key]}`);
        }
      }
    });
    filters = items.join(' AND ');
  }


  let search = '';
  // Format search strings.
  if (options.query) {
    search = options.query;
  }
  const variables = {
    id,
    filters,
    size,
    page,
  };

  const body = JSON.stringify({
    query,
    operationName: op,
    variables,
  });

  let response;
  let responseJSON;
  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body,
    });
  } catch (err) {
    throw new Error(err.message || err);
  }

  const { ok, statusText } = response;
  if (!ok) {
    throw new Error(`Error: ${statusText}`);
  }

  try {
    responseJSON = await response.json();
    return responseJSON;
  } catch (error) {
    throw new Error(`Error returning JSON: ${error}`);
  }
}

module.exports = api;
