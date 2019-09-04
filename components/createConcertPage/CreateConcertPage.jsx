import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Typography,
  Button,
  MenuItem
} from '@material-ui/core';
import './createConcertPage.css';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';

const iso_date_regex = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/;


/**
 * Define CreateConcertPage, a React componment of wrkspace
 */
class CreateConcertPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type: 'Select show type.', 
      viewable_by: '', // Array
      name: '', 
      date: '2015-03-25', 
      venue: '', 
      cosponsors: '', // Array
      owners: '', // Array
      artists: '', // Array
      guarantee: 0
    }

    const array_inputs = ['viewable_by', 'cosponsors', 'artists', 'guarantee']

    this.inputHandler = (type) => (event) => {
      this.setState({ [type]: event.target.value });
    }

    this.attempt_create_concert = this.attempt_create_concert.bind(this)
  }

  attempt_create_concert(){
    if (!this.validate_input_length()) {
      axios.post("/concert", { 
        type: this.state.type, 
        viewable_by: this.state.viewable_by.split(','), 
        name: this.state.name, 
        date: new Date(this.state.date), 
        venue: this.state.venue, 
        cosponsors: this.state.cosponsors.split(','), 
        owners: this.state.owners.split(','), 
        artists: this.state.artists.split(','), 
        guarantee: this.state.guarantee 
      }).then((val) => {
        console.log(val);
        this.setState({responseText: "Concert successfully created!"})
      }).catch((err) => {
        console.log(err, err.message);
        this.setState({responseText: "Error with concert creation...please try again later!"})
      });
    } else {
      console.log('Some fields are empty!')
    }
  }

  validate_input_length(){
    return this.state.name.length === 0 || 
           this.state.type.length === 0 || 
           this.state.viewable_by.length === 0 || 
           this.state.owners.length === 0
    console
  }


  render() {
    if (!this.props.loggedIn) { return <Redirect to="/login-register" /> }
      
    return (
      <div className="create-concert-container">
        <Typography variant="h5" color="inherit">
          Create a new concert:
        </Typography>
        <form noValidate autoComplete="off">
          <div className="flex-row">
            <TextField
              required
              id="name-create-concert"
              label="name"
              value={this.state.name}
              onChange={this.inputHandler('name')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              required
              id="type-create-concert"
              select
              label="type"
              value={this.state.type}
              onChange={this.inputHandler('type')}
              margin="normal"
              variant="outlined"
            >
            <MenuItem key='stanford-live' value='Stanford Live'>
              Stanford Live
            </MenuItem>
            <MenuItem key='producer-show' value='Producer Show'>
              Producer Show
            </MenuItem>
            <MenuItem key='special-show' value='Special Show'>
              Special Show
            </MenuItem>
            <MenuItem key='cosponsorship' value='Cosponsorship Show'>
              Cosponsorship Show
            </MenuItem>
            <MenuItem key='miscellaneous-show' value='Miscellaneous Show'>
              Miscellaneous Show
            </MenuItem>
            </TextField>
          </div>
          <div className="flex-row">
            <TextField
              id="date-create-concert"
              label="date"
              value={this.state.date}
              onChange={this.inputHandler('date')}
              margin="normal"
              variant="outlined"
            />
          </div>
          {iso_date_regex.test(this.state.date) ? "" : "Invalid date format. Please use YYYY-MM-DD."}
          <div className="flex-row">
            <TextField
              id="venue-create-concert"
              label="venue"
              type="venue"
              value={this.state.venue}
              onChange={this.inputHandler('venue')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="cosponsors-create-concert"
              label="cosponsors"
              type="cosponsors"
              value={this.state.cosponsors}
              onChange={this.inputHandler('cosponsors')}
              margin="normal"
              variant="outlined"
            />
          </div>
          {'Please input cosponsors list in comma-separated format (Eg. "Stanford Live, TDX"'}
          <div className="flex-row">
            <TextField
              id="owners-create-concert"
              label="owners"
              value={this.state.owners}
              onChange={this.inputHandler('owners')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="viewable_by-create-concert"
              label="viewable by"
              value={this.state.viewable_by}
              onChange={this.inputHandler('viewable_by')}
              margin="normal"
              variant="outlined"
            />
          </div>
          {'Please input permissions lists in comma-separated format (Eg. "Federico Reyes, Bella Cooper"'}
          <div className="flex-row">
            <TextField
              id="artists-create-concert"
              label="artists"
              value={this.state.artists}
              onChange={this.inputHandler('artists')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              id="guarantee"
              label="guarantee"
              type="number"
              value={this.state.guarantee}
              onChange={this.inputHandler('guarantee')}
              margin="normal"
              variant="outlined"
            />
          </div>
        </form>
        <div className="flex-row">
          <Button className="active-button" variant="contained" onClick={this.attempt_create_concert}>Create Concert</Button>
        </div>
        {this.validate_input_length() ? "Please fill out all required fields!" : ""}
        {this.state.responseText}
      </div>
      );
  }
}

export default CreateConcertPage;
