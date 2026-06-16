const express = require("express");
const axios = require("axios");
var cors = require("cors");
const querystring = require('querystring');

const CLIENT_ID = "fdc3c5d6-4bd4-40c0-b681-d2ad2f5db414";
const CLIENT_SECRET = "78cfedec-57ad-4218-83a2-49a49d75a902";

const apiHost = 'http://localhost:53136'; 
//const apiHost = 'http://apidev.qqcatalyst.com'; 
const loginHost = 'https://localhost:44314';
// const loginHost = 'https://logindev.qqcatalyst.com'
const tokenURL = loginHost + '/oauth/token';
const redirectUri = 'http://localhost:9000/oauth/redirect'; 

const app = express();

app.use(cors({ credentials: true, origin: true }));

// ping
app.get("/ping", (req, res) => {
  res.send("Pong!");
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// oauth callback
app.get("/oauth/redirect", (req, res) => {
  const params = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: req.query.code,       
    scope: 'openid', 
    redirect_uri: redirectUri,
  }; 

  axios
    .post(`${tokenURL}`,  querystring.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
  })
    .then((response) => {
      console.log("Returned Access Token"); 
      console.log(response.data);
      console.log(response.data.access_token); 
      res.redirect(
        `http://localhost:3000?access_token=${response.data.access_token}`
      );
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      res.send("Error" + error);
    });
});

app.get("/api", (req, res) => {
  console.log("api request")
  axios
      .get(`${apiHost}/v1/Carriers`, {
      // .get(`${apiHost}/v1/BusinessLogic/Ping`, {
        headers: {
          Authorization: "Bearer " + req.query.access_token,
        },
      })
      .then((resp) => {
        res.send(resp.data);
       
      })
      .catch((error) => {
        console.log(error); 
        res.send("Error: " + error);
      });
});


const PORT = 9000;
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});
