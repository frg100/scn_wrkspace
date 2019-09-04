import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Typography,
  Button
} from '@material-ui/core';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';


/**
 * Define FinancialRequestsPage, a React componment of wrkspace
 */
class FinancialRequestsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'financial-requests': []
    }
  }


  render() {
    if (!this.props.loggedIn) { return <Redirect to="/login-register" /> }
      
    return (
        <div className="financial-requests-page-container">
          <Typography variant="h5" color="inherit">
            This is the page where you'll see all financial requests.
          </Typography>
        </div>
      );
  }
}

export default FinancialRequestsPage;
