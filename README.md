### Lab 43 Google OAuth

#### Documentation  
This application does one thing, use Google OAuth to validate a user and return their Google Plus Profile Information.

### Usage
To use this program clone/fork the repository.
A .env file need to be created in-order to use this application. I have provided those details below:
```
CLIENT_URL=http://localhost:8080
GOOGLE_OAUTH_ID=1015603385295-kvoo2o8u7s2d7gufahoineo6f3tnpuub.apps.googleusercontent.com
GOOGLE_OAUTH_SECRET=_Yb5l7bndbw4XLA5eJPn7_Mi
API_URL=http://localhost:3000
PORT=3000
```

Once inside the application folder, locate the back-end and turn the server on
```
cd back-end
node index.js
```
Open a new Tab in the terminal and open the front-end index.html

```
cd ../front-end
open index.html
```

Click on the Google image to begin the OAuth process. The steps and results of the process can be viewed in the terminal window running the back-end router.

### Build
Building OAuth has many steps and is quite particular.
1. The user needs to create a new project using the Google Developer Console.
2. Once an ID and secret have been made the user can begin building the code to work with Google OAuth.
3. The link for the front-end is standard and should look exactly as follows unless the developer has a different Scope they want from the user
```
"https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=SHOULD_BE_YOUR_BACKEND_ROUTE&scope=openid%20email%20profile&client_id=SHOULD_BE_YOUR_UNIQUE_CLIENT_ID_FROM_GOOGLE&prompt=consent&response_type=code"
```
4. On the back-end create a Promise Chain that handles the communication between the developer web application and Google. The following steps will apply
- Make a request for a unique code from Google
- Send the code recieved back to Google with correct credentials
```
app.get('/oauth/google', (request, response) => {
  if(!request.query.code) {
    response.redirect(process.env.CLIENT_URL);
  } else {
    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_OAUTH_ID,
        client_secret: process.env.GOOGLE_OAUTH_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`
      })
```
- Recieve a unique token from Google
- Use the Token to access Google Plus at OPEN_ID_URL
```
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
```

```
.then(tokenResponse => {
        if(!tokenResponse.body.access_token) {
          response.redirect(process.env.CLIENT_URL);
        }
        const accessToken = tokenResponse.body.access_token;
        return superagent.get(OPEN_ID_URL)
          .set('Authorization', `Bearer ${accessToken}`);
      })
```
- Lastly Redirect the response from Google Plus to the developer CLIENT_URL and use the information in response.body. Creating a cookie at this point is appropriate.

```
.then(openIDResponse => {
        response.cookie('GOAuth-lab43-token', '12345');
        response.redirect(process.env.CLIENT_URL);
      })
      .catch(error => {
        console.log(error);
        response.redirect(process.env.CLIENT_URL + '?error=oauth');
      });
```

