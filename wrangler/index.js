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

// Create a listing
router.add('POST', '/listings', async (request, response) => {
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

// Get all listings
router.add('GET', '/listings', async (request, response) => {
  try {
    const query = Call(
      "GetAllListings",
      "",
    );
    
    const result = await faunaClient.query(query);
  
    response.send(200, result);  
  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  };
});

// Create a bid
router.add('POST', '/listings/:listingId/bids', async (request, response) => {
  try {
    const { listingId } = request.params;
    const { bidder, amount } = await request.body();  

    const query = Call(
      "CreateBid",
      [
        listingId,
        {
          bidder: bidder,
          amount: amount,
        }
      ]
    );
    
    const result = await faunaClient.query(query);
  
    response.send(200, result);  
  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  };
});

// Get the highest bid
router.add('GET', '/listings/:listingId/bids', async (request, response) => {
  try {
    const { listingId } = request.params;

    const query = Call(
      "GetHighestBid",
      listingId.toString(),
    );
    
    const result = await faunaClient.query(query);
  
    response.send(200, result);  
  } catch (error) {
    const faunaError = getFaunaError(error);
    response.send(faunaError.status, faunaError);
  };
});

listen(router.run);
