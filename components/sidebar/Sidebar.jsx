import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: [
        {'display_name': 'Home',               'router_name': '/home'},
        {'display_name': 'Concerts',           'router_name': '/concerts'}, 
        {'display_name': 'Financial Requests', 'router_name': '/financial-requests'},
      ]
    }
  }

  render() {
    if (!this.props.loggedIn) { return null }

    const pageListItems = this.state.pages.map((page) => {
      const { display_name, router_name } = page
      const MyLink = props => <Link {...props} to={router_name} />
      return (
        <div key={page.display_name}>
          <ListItem button component={MyLink}>
            <ListItemText primary={display_name} />
          </ListItem>
          <Divider />
        </div>
      )
    });

    return (
      <div>
        <List component="nav">
          {pageListItems}
        </List>
      </div>
    );
  }
}

export default Sidebar;
