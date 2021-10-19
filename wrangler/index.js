// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { Router, listen } from 'worktop';
import faunadb from 'faunadb';
import {customFetch, getFaunaError} from './utils.js';

const router = new Router();

const faunaClient = new faunadb.Client({
  secret: FAUNA_SECRET,
  fetch: customFetch
});

const { Call } = faunadb.query;

router.add('GET', '/', async (request, response) => {
  response.send(200, 'Hello, worktop!');
});

router.add('POST', '/listing', async (request, response) => {
  const { title, description, reserve } = await request.body();

  try {
    const query = Call(
      "CreateListing",
      {
        data: {
          title: title,
          description: description,
          reserve: reserve
        }
      },
    );
    
    const result = await faunaClient.query(query);
  
    response.send(200, result);  
  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  };
});

listen(router.run);
