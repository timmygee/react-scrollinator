import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';


const Scrollinator = (ComposedComponent) => (

  class extends Component {
    constructor(props) {
      super(props);

      this.state = {
        documentRect: null,
      };

      this.handleScroll = this.handleScroll.bind(this);
      this.savePositions = this.savePositions.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        this.savePositions();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    savePositions() {
        this.setState({
          ...this.state,
          documentRect: document.documentElement.getBoundingClientRect(),
          componentRect: findDOMNode(this).getBoundingClientRect(),
        });
    }

    handleScroll() {
      this.savePositions();
    }

    render() {
      const { state, props } = this;

      console.log(state.documentRect, state.componentRect)

      return (
        <ComposedComponent
          {...props}
          {...state}
        />
      );
    }
  }

);


export default Scrollinator;
