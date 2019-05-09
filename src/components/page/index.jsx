import React, {Component} from "react";
import ReactDOM from "react-dom";
import './style.css';

class Page extends Component {
  render() {
    return (
      <div>
        <h1 styleName="title">Hello Page</h1>
        <img src={require('image/bing3.jpg')} />
      </div>
      
    )
  }
}

export default Page;