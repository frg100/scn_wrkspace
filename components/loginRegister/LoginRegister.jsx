import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Typography,
  Button
} from '@material-ui/core';
import './loginRegister.css';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';


/**
 * Define LoginRegister, a React componment of CS142 project #7
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginName: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      position: "",
      responseText: "Click the button to login!",
      page: "login"
    }

    this.attemptLogin = this.attemptLogin.bind(this);
    this.attemptRegister = this.attemptRegister.bind(this);

    this.inputHandler = (type) => (event) => {
      this.setState({ [type]: event.target.value });
    }
  }

  attemptLogin(){
    axios.post("/admin/login", {login_name: this.state.loginName, password: this.state.password})
        .then((res) => {
          const {user_id, user} = res.data
          this.setState({ user_id });   
          this.props.flipLoginState();
          this.props.setLoggedInUser(user_id)  
        }).catch((err) => {
            this.setState({responseText: "Hmm...user not found or invalid password. Please try again!"})
        });
  }

  attemptRegister(){
    axios.post("/user", {
      login_name: this.state.loginName, 
      password: this.state.password, 
      first_name: this.state.firstName, 
      last_name: this.state.lastName,
      position: this.state.position
    }).then((val) => {
      console.log(val);
      this.setState({responseText: "Registration successful! You can now log in!"})
    }).catch((err) => {
      console.log(err, err.message);
      if (err.statusCode === 'User already exists!'){
        this.setState({responseText: "Login name taken. Please choose a different one."})
      } else if (err.message === 'Empty fields not allowed!'){
        this.setState({responseText: "Please fill in all required fields"})
      } else {
        this.setState({responseText: "Error with registration...please try again later"})
      }
    });
  }

  render() {
    if (this.props.loggedIn && this.state.user_id) { return <Redirect to={'/home'} /> }

    if (this.state.page === 'login'){
      return (
        <div className="login-container">
          <form noValidate autoComplete="off">
            <TextField
              id="login-name-input"
              label="login name"
              value={this.state.loginName}
              onChange={this.inputHandler('loginName')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="login-password-input"
              label="password"
              type="password"
              value={this.state.password}
              onChange={this.inputHandler('password')}
              margin="normal"
              variant="outlined"
            />
          </form>
          <div className="flex-row">
            <Button onClick={() => this.setState({page: 'register'})}>Register</Button>
            <Button variant="contained" className="active-button" onClick={this.attemptLogin}>Login</Button>
          </div>
          {this.state.responseText}
        </div>
      );
    } else if (this.state.page === 'register'){
      return (
        <div className="register-container">
          <Typography variant="h5" color="inherit">
            Register new user:
          </Typography>
          <form noValidate autoComplete="off">
            <div className="flex-row">
              <TextField
                required
                id="first-name-register"
                label="first name"
                value={this.state.firstName}
                onChange={this.inputHandler('firstName')}
                margin="normal"
                variant="outlined"
              />
              <TextField
                required
                id="last-name-register"
                label="last name"
                value={this.state.lastName}
                onChange={this.inputHandler('lastName')}
                margin="normal"
                variant="outlined"
              />
            </div>
            <TextField
              required
              id="login-name-register"
              label="login name"
              value={this.state.loginName}
              onChange={this.inputHandler('loginName')}
              margin="normal"
              variant="outlined"
            />
            <div className="flex-row">
              <TextField
                required
                id="password-register"
                label="password"
                type="password"
                value={this.state.password}
                onChange={this.inputHandler('password')}
                margin="normal"
                variant="outlined"
              />
              <TextField
                required
                id="confirm-password-register"
                label="confirm password"
                type="password"
                value={this.state.confirmPassword}
                onChange={this.inputHandler('confirmPassword')}
                margin="normal"
                variant="outlined"
              />
            </div>
            {this.state.password === this.state.confirmPassword ? "" : "Passwords don't match!"}
            <div className="flex-row">
              <TextField
                id="position-register"
                label="position"
                value={this.state.position}
                onChange={this.inputHandler('position')}
                margin="normal"
                variant="outlined"
              />
            </div>
          </form>
          <div className="flex-row">
            <Button className="active-button" onClick={() => this.setState({page: 'login'})}>Login</Button>
            <Button variant="contained" onClick={this.attemptRegister}>Register</Button>
          </div>
          {this.state.responseText}
        </div>
      );
    }
  }
}

export default LoginRegister;
