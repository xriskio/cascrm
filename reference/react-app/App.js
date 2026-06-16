import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [data, setData] = useState(null);
  const loginHost = 'https://localhost:44314';
  // const loginHost = 'https://logindev.qqcatalyst.com'
  const oauthLogin = loginHost + '/oauth/authorize'; 
  const redirectUri = 'http://localhost:9000/oauth/redirect'; 

  const token = new URLSearchParams(window.location.search).get(
    "access_token"
  );
  useEffect(() => {
  
    if (token && token.length > 0) {
      setLoggedIn(true); 
      axios.get('http://localhost:9000/api?access_token=' + token).then(
        function(resp) {
          setData(resp.data)
        }).catch(function(err) {
          console.log(err); 
        })
    }
  }, [token]);

  return (
    <div className="App text-center container-fluid">
      {!loggedIn ? (
        <>
          <img alt="qq" className="mb-4" src="/qq.png" width="150"></img>
          <h1 className="h3 mb-3 font-weight-normal">Sign in with QQ OAuth2</h1>
          <Button
            type="primary"
            className="btn"
            size="lg"
            href={`${oauthLogin}?client_id=fdc3c5d6-4bd4-40c0-b681-d2ad2f5db414&redirect_uri=${redirectUri}&response_type=code`}
          >
            Sign in
          </Button>
        </>
      ) : (
        <div>
          <h1>Welcome!</h1>
          <p>This is a simple test app for QQ API access via OAuth2</p>


          <Card style={{ maxWidth: "75%", margin: "auto" }}>
            <Card.Body>
              <Card.Header>Token: </Card.Header>
              <Card.Text>{token}</Card.Text>
              <Card.Header className="mt-4">Sample API Call Data: </Card.Header>
              <Card.Text><pre>{JSON.stringify(data)}</pre></Card.Text>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
