import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemText, ListItemIcon, Checkbox
} from '@material-ui/core';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {}
    }

    this.logOut = this.logOut.bind(this);

    //this function is called when user presses the update button
    this.get_user({});
  }

  get_user(prevState){
    if (this.props.user_id){
      axios.get(`/user/${this.props.user_id}`)
        .then((val) => {
          const user = val.data;
          if (!prevState.user || !prevState || prevState.user.login_name != user.login_name){
           this.setState({ user });         
          }
        }).catch((err) => {
          if (err.response.status === 401){
            console.log('Not logged in!')
            this.setState({ user: {} });
          }
          console.log('Error getting user', err);
      });
    }
  }

  componentDidUpdate(prevProps, prevState){
    this.get_user(prevState);
  }

  logOut(){
    axios.post("/admin/logout", {})
      .then((val) => {
        console.log(val);
        this.props.flipLoginState();
      })
      .catch((err) => {
        console.log(err);
    });
  }


  render() {
    let head, mid, tail;
    if (this.props.loggedIn){
      head = 'wrkspace || SCN'
      mid = this.state.user ? `${this.state.user.first_name} ${this.state.user.last_name}, ${this.state.user.position}` : ''
      tail = <Button href="#/login-register" className="logout-button" onClick={this.logOut}>Logout</Button>
    } else {
      head = "Please Login";
      mid = null
      tail =<Button href="#/login-register" className="login-button">Login</Button>
    }

    if (!this.state.user){
      mid = null;
    }

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <div className="container">
            <Typography variant="h5" color="inherit">
                {head}
            </Typography>
            <Typography variant="subtitle1" color="inherit">
                {mid}
            </Typography>
            <Typography variant="subtitle1" color="inherit">
                {tail}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
