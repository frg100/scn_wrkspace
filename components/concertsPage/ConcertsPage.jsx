import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import ShareIcon from '@material-ui/icons/Share';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './concertsPage.css';
import TextField from '@material-ui/core/TextField';

/**
 * Define ConcertsPage, a React componment of wrkspace
 */
class ConcertsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      concerts: []
    }

    this.get_viewable_concerts({})
  }

  get_viewable_concerts(prevState){
    if (this.props.user_id){
      axios.get(`/concerts-for-user/${this.props.user_id}`)
        .then((val) => {
          const concerts = val.data;
          if (concerts && !prevState.concerts || !prevState){
            this.setState({ concerts });         
          }
          if (concerts && prevState.concerts 
              && concerts.length !== 0 && prevState.concerts.length !== 0 
              && !(prevState.concerts[0].concert_id === concerts[0].concert_id)){
            this.setState({ concerts });
          }
        }).catch((err) => {
          if (err.status && err.response.status === 401){
            console.log('Not logged in!')
          }
          console.log('Error getting concerts: ', err);
      });
    }
  }

  componentDidUpdate(prevProps, prevState){
    this.get_viewable_concerts(prevState);
  }


  render() {
    if (!this.props.loggedIn) { return <Redirect to="/login-register" /> }

    const LinkToCreateConcert = props => <Link {...props} to='/create-concert' />

    const concert_items = this.state.concerts.map(concert => {
      const LinkToConcert = props => <Link {...props} to={`/concerts/${concert.concert_id}`} />

      return(
        <ListItem key={concert.name} button component={LinkToConcert}>
          <ListItemText primary={concert.name} />
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
        </ListItem>
      )
    });

    return (
        <div className="concerts-page-container">
          <Typography variant="h5" color="inherit">
            <List component="nav" aria-label="main mailbox folders">
              {concert_items}
            </List>
          </Typography>
          <Button variant="contained" component={LinkToCreateConcert}>
            Create new concert
          </Button>
        </div>
      );
  }
}

export default ConcertsPage;
