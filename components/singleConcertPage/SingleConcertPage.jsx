import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Typography,
  Button,
  MenuItem
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './singleConcertPage.css';
import TextField from '@material-ui/core/TextField';

const iso_date_regex = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/;

/**
 * Define SingleConcertPage, a React componment of wrkspace
 */
class SingleConcertPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      concert_id: this.props.match.params.concert_id,
      concert: {}
    }

    this.inputHandler = (type) => (event) => {
      var concert = {...this.state.concert}
      concert[type] = event.target.value
      this.setState({ concert });
    }

    this.get_concert({});

    this.validate_input_length = this.validate_input_length.bind(this);
    this.attempt_save_changes = this.attempt_save_changes.bind(this);
  }

  get_concert(prevState){
    if (this.state.concert_id){
      axios.get(`/concert/${this.state.concert_id}`)
        .then((val) => {
          const concert = val.data;
          // Turn array fields back to strings
          concert.viewable_by = concert.viewable_by.join(',')
          concert.artists = concert.artists.join(',')
          concert.owners = concert.owners.join(',')
          concert.cosponsors = concert.cosponsors.join(',')
          // Set the new state
          if (concert && !prevState.concert || !prevState){
            this.setState({ concert });         
          }
          if (concert && prevState.concert  && !(prevState.concert.concert_id === concert.concert_id)){
            this.setState({ concert });
          }
        }).catch((err) => {
          if (err.status && err.response.status === 401){
            console.log('Not logged in!')
          }
          console.log('Error getting concert: ', err);
      });
    }
  }

  componentDidUpdate(prevProps, prevState){
    this.get_concert(prevState);
  }

  attempt_save_changes(){
    if (!this.validate_input_length()) {
      axios.post("/concert", { 
        type: this.state.concert.type, 
        viewable_by: this.state.concert.viewable_by.split(','), 
        name: this.state.concert.name, 
        date: new Date(this.state.concert.date), 
        venue: this.state.concert.venue, 
        cosponsors: this.state.concert.cosponsors.split(','), 
        owners: this.state.concert.owners.split(','), 
        artists: this.state.concert.artists.split(','), 
        guarantee: this.state.concert.guarantee,
        concert_id: this.state.concert.concert_id,
      }).then((val) => {
        console.log(val);
        this.setState({editing: false })
        this.setState({responseText: "Concert successfully updated!"})
      }).catch((err) => {
        console.log(err, err.message);
        this.setState({responseText: "Error with concert save...please try again later!"})
      });
    } else {
      console.log('Some fields are empty!')
    }
  }

  validate_input_length(){
    // Check if concert is empty
    if (!this.state.concert.name) {
      return false; 
    }

    return (this.state.concert.name.length === 0 || 
           this.state.concert.type.length === 0 || 
           this.state.concert.viewable_by.length === 0 || 
           this.state.concert.owners.length === 0)
  }

  render() {
    if (!this.props.loggedIn) { return <Redirect to="/login-register" /> }

    if (!this.state.concert || !this.state.concert.name) { return <div>{"No concert here!"}</div> }

    return (
      <div className="single-concert-container">
        <Typography variant="h5" color="inherit">
          Concert
        </Typography>
        <form noValidate autoComplete="off">
          <div className="flex-row">
            <TextField
              required
              id="name-create-concert"
              label="name"
              value={this.state.concert.name}
              onChange={this.inputHandler('name')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
          </div>
          <div className="flex-row">
            <TextField
              required
              id="type-create-concert"
              select
              label="type"
              value={this.state.concert.type}
              onChange={this.inputHandler('type')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
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
              value={this.state.concert.date}
              onChange={this.inputHandler('date')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
          </div>
          {iso_date_regex.test(this.state.concert.date) ? "" : "Invalid date format. Please use YYYY-MM-DD."}
          <div className="flex-row">
            <TextField
              id="venue-create-concert"
              label="venue"
              type="venue"
              value={this.state.concert.venue}
              onChange={this.inputHandler('venue')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
            <TextField
              id="cosponsors-create-concert"
              label="cosponsors"
              type="cosponsors"
              value={this.state.concert.cosponsors}
              onChange={this.inputHandler('cosponsors')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
          </div>
          {this.state.editing ? 'Please input cosponsors list in comma-separated format (Eg. "Stanford Live, TDX"' : ""}
          <div className="flex-row">
            <TextField
              id="owners-create-concert"
              label="owners"
              value={this.state.concert.owners}
              onChange={this.inputHandler('owners')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
            <TextField
              id="viewable_by-create-concert"
              label="viewable by"
              value={this.state.concert.viewable_by}
              onChange={this.inputHandler('viewable_by')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
          </div>
          {this.state.editing ? 'Please input permissions lists in comma-separated format (Eg. "Federico Reyes, Bella Cooper"' : ''}
          <div className="flex-row">
            <TextField
              id="artists-create-concert"
              label="artists"
              value={this.state.concert.artists}
              onChange={this.inputHandler('artists')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
            <TextField
              id="guarantee"
              label="guarantee"
              type="number"
              value={this.state.concert.guarantee}
              onChange={this.inputHandler('guarantee')}
              margin="normal"
              variant="outlined"
              InputProps={{
                readOnly: !this.state.editing,
              }}
            />
          </div>
        </form>
        <div className="flex-row">
          {this.state.editing
            ? <Button className="active-button" variant="contained" onClick={this.attempt_save_changes}>Save Changes</Button>
            : <Button className="button" variant="contained" onClick={() => this.setState({ editing: true })}>Edit Concert</Button>
          }
        </div>
        {this.validate_input_length() ? "Please fill out all required fields!" : ""}
        {this.state.responseText}
      </div>
    );
  }
}

export default SingleConcertPage;
