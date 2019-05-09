import React, {Component} from "react";
import ReactDOM from "react-dom";

class Nav extends Component {
  render() {
    return (
      <div>
        <h1>Hello Nav</h1>
        <img src={require('image/bing3.jpg')} />
      </div>
      
    )
  }
}

export default Nav;