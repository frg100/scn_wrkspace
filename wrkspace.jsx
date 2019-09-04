import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';
import Cookies from 'js-cookie';

// import necessary components
import TopBar from './components/topBar/TopBar';
import LoginRegister from './components/loginRegister/LoginRegister';
import ConcertsPage from './components/concertsPage/ConcertsPage';
import CreateConcertPage from './components/createConcertPage/CreateConcertPage';
import FinancialRequestsPage from './components/financialRequestsPage/FinancialRequestsPage';
import SingleConcertPage from './components/singleConcertPage/SingleConcertPage';
import Sidebar from './components/sidebar/Sidebar';

class Wrkspace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false
    }
    console.log(Cookies.get('logged-in'))
    this.flipLoginState = this.flipLoginState.bind(this)
    this.setLoggedInUser = this.setLoggedInUser.bind(this)
  }

  flipLoginState() {
    this.setState((prevState) => {
      return {loggedIn: !prevState.loggedIn}
    });
  }

  setLoggedInUser(uID) {
    this.setState({ user_id: uID })
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar loggedIn={this.state.loggedIn} user_id={this.state.user_id} flipLoginState={this.flipLoginState} />
          </Grid>
          <div className="cs142-main-topbar-buffer"/>
          <Grid item sm={3}>
            <Paper  className="cs142-main-grid-item">
              <div>
                 <Sidebar loggedIn={this.state.loggedIn} user_id={this.state.user_id}/>
              </div>
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="cs142-main-grid-item">
              <Switch>
                <Route path="/login-register" render={ props => <LoginRegister {...props} loggedIn={this.state.loggedIn} flipLoginState={this.flipLoginState} setLoggedInUser={this.setLoggedInUser} />} />
                <Route path="/concerts/:concert_id"
                  render={ props => <SingleConcertPage {...props} loggedIn={this.state.loggedIn} user_id={this.state.user_id}/> }
                />
                <Route path="/create-concert" render={ props => <CreateConcertPage {...props} loggedIn={this.state.loggedIn}  user_id={this.state.user_id} />} />
                <Route path="/concerts" render={ props => <ConcertsPage {...props} loggedIn={this.state.loggedIn}  user_id={this.state.user_id} />} />
                <Route path="/financial-requests" render={ props => <FinancialRequestsPage {...props} loggedIn={this.state.loggedIn}  user_id={this.state.user_id} />} />
              </Switch>
            </Paper>
          </Grid>
        </Grid>
      </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <Wrkspace current_url={window.location.href} />,
  document.getElementById('wrkspaceapp'),
);
