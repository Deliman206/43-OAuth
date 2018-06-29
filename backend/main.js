'use strict';

import express from 'express';
import superagent from 'superagent';

const app = express();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

app.get('/oauth/google', (request, response) => {
  console.log('___STEP 3.1 - RECEIVING CODE__');
  if(!request.query.code) {
    response.redirect(process.env.CLIENT_URL);
  } else {
    console.log('__CODE__', request.query.code);
    console.log('___STEP 3.2 - SENDING THE CODE BACK__');
    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_OAUTH_ID,
        client_secret: process.env.GOOGLE_OAUTH_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`
      })
      .then(tokenResponse => {
        console.log('___STEP 3.3 - ACCESS TOKEN__');

        if(!tokenResponse.body.access_token) {
          response.redirect(process.env.CLIENT_URL);
        }
        const accessToken = tokenResponse.body.access_token;
        return superagent.get(OPEN_ID_URL)
          .set('Authorization', `Bearer ${accessToken}`);
      })
      .then(openIDResponse => {
        console.log('___STEP 4 - OPEN ID__');
        console.log(openIDResponse.body);
        response.cookie('GOAuth-lab43-token', '12345');
        response.redirect(process.env.CLIENT_URL);
      })
      .catch(error => {
        console.log(error);
        response.redirect(process.env.CLIENT_URL + '?error=oauth');
      });
  }
});

  app.listen(process.env.PORT, () => {
    console.log('__SERVER_UP__', process.env.PORT);
  });
