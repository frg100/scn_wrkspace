import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Typography, Button
} from '@material-ui/core';
import './HomePage.css';
import axios from 'axios';
import {DropzoneDialog} from 'material-ui-dropzone';

/**
 * Define HomePage, a React componment of wrkspace
 */
class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {}
    }

    //this function is called when user presses the update button
    this.get_user({});

    this.handleSave = (file) => {
        //Saving files to state for further use and closing Modal.
        console.log('file in handleSave:', file.name)
        var user = {...this.state.user}
        user.profile_image_url = file.name
        this.setState({ user, file: file, dropzone_open: false });
    }
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


  render() {
    if (!this.props.loggedIn) { return <Redirect to="/login-register" /> }
    if (!this.state.user) { return (<div>{"No user here!"}</div>)}

    const image_url = this.state.user.profile_image_url
    const upload_button = (<Button onClick={() => this.setState({ dropzone_open: true })}>Add Image</Button>)
    const dropzone_component = (
      <DropzoneDialog
        open={this.state.dropzone_open}
        onSave={this.handleSave}
        acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
        filesLimit={1}
        showPreviews={true}
        maxFileSize={5000000}
        onClose={() => this.setState({ dropzone_open: false })}
      />
    )

    const image_upload_component = (
      <div>
        {upload_button}
        {dropzone_component}
      </div>
    )

    const user_image_section = image_url ? (<img src={image_url} alt="User Profile Image"/>) : image_upload_component

    return (
      <div className="homepage-container">
        <div className="flex-row">
          <div className="user-information">
            <Typography variant="h5" color="inherit">
              {`Welcome ${this.state.user.first_name} ${this.state.user.last_name}`}
            </Typography>
            <Typography color="inherit">
              {this.state.user.position}
            </Typography>
          </div>
          <div className="user-image">
            {user_image_section}
          </div>
        </div>
      </div>
    );
  }
}

export default HomePage;
