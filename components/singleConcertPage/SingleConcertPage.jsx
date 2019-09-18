import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Typography,
  Button,
  MenuItem,
  Avatar,
  Grid
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
      concert: {},
      users: []
    }

    this.inputHandler = (type) => (event) => {
      var concert = {...this.state.concert}
      concert[type] = event.target.value
      this.setState({ concert });
    }

    this.add_user = (type) => (event) => {
      const user = event.target.value
      var concert = {...this.state.concert}
      if (type === 'new_owner'){
        if (!concert.owners.includes(user)){
          concert.owners.push(user);
        }
      } else if (type === 'new_visibility'){
        if (!concert.viewable_by.includes(user)){
          concert.viewable_by.push(user);
        }
      }
      this.setState({ concert });
    }

    this.remove_owner = (id) => (event) => {
      if (!this.state.editing) {return}
      var concert = {...this.state.concert}
      concert.owners = concert.owners.filter(item => item !== id)
      this.setState({ concert });
    }

    this.remove_viewable_by = (id) => (event) => {
      if (!this.state.editing) {return}
      var concert = {...this.state.concert}
      concert.viewable_by = concert.viewable_by.filter(item => item !== id)
      this.setState({ concert });
    }

    this.get_concert({});
    this.get_users({});

    this.validate_input_length = this.validate_input_length.bind(this);
    this.attempt_save_changes = this.attempt_save_changes.bind(this);
  }

  get_users(prevState){
    axios.get('/user/all')
      .then((val) => {
        const users = val.data[0]
        if (((!prevState.users || !prevState.users[0]) && users[0]) || prevState.users[0].user_id !== users[0].user_id){
          this.setState({ users });
        }
      }).catch((err) => {
          if (err.status && err.response.status === 401){
            console.log('Not logged in!')
          }
          console.log('Error getting users: ', err);
      });
  }

  get_concert(prevState){
    if (this.state.concert_id){
      axios.get(`/concert/${this.state.concert_id}`)
        .then((val) => {
          const concert = val.data;
          // Turn array fields back to strings
          concert.artists = concert.artists.join(',')
          concert.cosponsors = concert.cosponsors.join(',')
          concert.date = concert.date.toString().substring(0, "YYYY-MM-DD".length)
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
    this.get_users(prevState);
  }

  attempt_save_changes(){
    if (!this.validate_input_length()) {
      axios.post("/concert", { 
        type: this.state.concert.type, 
        viewable_by: this.state.concert.viewable_by,
        name: this.state.concert.name, 
        date: new Date(this.state.concert.date), 
        venue: this.state.concert.venue, 
        cosponsors: this.state.concert.cosponsors.split(','), 
        owners: this.state.concert.owners, 
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

    if (!this.state.concert || !this.state.concert.name || this.state.users.length === 0) { return <div>{"No concert here!"}</div> }

    const user_input_dropdowns = (
      <div className="flex-row">
        <TextField
          id="owners-create-concert"
          label="add owner"
          select
          value="Select User"
          onChange={this.add_user('new_owner')}
          margin="normal"
          variant="outlined"
          InputProps={{
            readOnly: !this.state.editing,
          }}
        >
        {this.state.users.map(user => (
            <MenuItem key={`owners-${user.login_name}`} value={user.user_id}>
              {`${user.first_name} ${user.last_name}`}
            </MenuItem>
        ))}
        </TextField>
        <TextField
          id="viewable_by-create-concert"
          label="viewable by"
          select
          value="Select User"
          onChange={this.add_user('viewable_by')}
          margin="normal"
          variant="outlined"
          InputProps={{
            readOnly: !this.state.editing,
          }}
        >
        {this.state.users.map(user => (
            <MenuItem key={`owners-${user.login_name}`} value={user.user_id}>
              {`${user.first_name} ${user.last_name}`}
            </MenuItem>
        ))}
        </TextField>
      </div>
    )

    const remove_users_prompt = (
      <Typography color="inherit">
        Click to remove users
      </Typography>
    )

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
          <div className="flex-row">
            <Typography color="inherit">
              Concert owners
            </Typography>
            <Typography color="inherit">
              Concert is viewable by
            </Typography>
          </div>
          <div className="flex-row">
            <Grid key="owners-grid" container justify="flex-start" alignItems="center">
              {this.state.concert.owners && this.state.concert.owners.map((owner_id) => {
                  // For each owner (given the user id, get the name and display as an avatar)
                  owner_id = owner_id.trim()
                  const owner_dict = this.state.users.filter(user => user.user_id == owner_id)[0];
                  return (<Avatar key={owner_dict.user_id} className="user-avatar" onClick={this.remove_owner(owner_dict.user_id)}>
                            {`${owner_dict.first_name.charAt(0)} ${owner_dict.last_name.charAt(0)}`}
                          </Avatar>)
                })
              }
            </Grid>
            <Grid key="viewable_by-grid" container justify="flex-end" alignItems="center">
              {this.state.concert.viewable_by && this.state.concert.viewable_by.map((viewable_by_id) => {
                  // For each owner (given the user id, get the name and display as an avatar)
                  viewable_by_id = viewable_by_id.trim()
                  const viewable_by_dict = this.state.users.filter(user => user.user_id == viewable_by_id)[0];
                  return (<Avatar key={viewable_by_dict.user_id} className="user-avatar" onClick={this.remove_viewable_by(viewable_by_dict.user_id)}>
                            {`${viewable_by_dict.first_name.charAt(0)} ${viewable_by_dict.last_name.charAt(0)}`}
                          </Avatar>)
                })
              }
            </Grid>
          </div>
          {this.state.editing && user_input_dropdowns}
          {this.state.editing && remove_users_prompt}
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
