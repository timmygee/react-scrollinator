import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';


const Scrollinator = () => (ComposedComponent) => (

  class extends Component {
    constructor(props) {
      super(props);

      this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
      // Do stuff
    }

    render() {
      const { state, props } = this;
      return (
        <ComposedComponent
          ref='wrappedComponent'
          {...props}
          {...state}
        />;
      );
    }
  }

);


export default Scrollinator;
