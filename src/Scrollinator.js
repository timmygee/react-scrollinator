import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';


const MIN_CHILD_BOTTOM_MARGIN = 70;


const Scrollinator = (ComposedComponent) => (

  class extends Component {
    constructor(props) {
      super(props);

      this.state = {
        documentRect: null,
        componentRect: null,
        scrollinatorReady: false,
        childScrollProps: [],
      };

      this.handleScroll = this.handleScroll.bind(this);
      this.savePositions = this.savePositions.bind(this);
      this.getScrollProps = this.getScrollProps.bind(this);
      this.childScrollPropsHandler = this.childScrollPropsHandler.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        this.savePositions();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    savePositions() {
      const componentRectNode = findDOMNode(this);
      const componentRect = componentRectNode ? componentRectNode.getBoundingClientRect() : null;

      this.setState({
        ...this.state,
        componentRect,
        documentRect: document.documentElement.getBoundingClientRect(),
        scrollinatorReady: !!componentRect,
      });
    }

    handleScroll() {
      this.savePositions();
    }

    childScrollPropsHandler(scrollProps) {
      const { childScrollProps } = this.state;
      childScrollProps.push(scrollProps);
      this.setState({ ...this.state, childScrollProps });
    }

    getScrollProps() {
      const { documentRect, componentRect, scrollinatorReady, childScrollProps } = this.state;

      console.log(childScrollProps)

      const scrollProps = {};

      if (componentRect) {
        // How scrolled down the page the document is
        scrollProps.scrollY = 0 - documentRect.top;
        // The Y scroll position of the top of the component
        scrollProps.componentTopY = componentRect.top;
        // The Y scroll position of the bottom of the component
        scrollProps.componentBottomY = componentRect.bottom;
        // The distance in pixels from top of the document to the the top of the component
        scrollProps.componentTop = componentRect.top - documentRect.top;
        // The height of the component
        scrollProps.componentHeight = componentRect.height;
        // The height of the viewport
        scrollProps.viewportHeight = window.innerHeight;

        if (childScrollProps.length) {
          // If we have got the ScrollinatorChild properties sent back via the
          // childScrollPropsHandler callback then we can perform calculations based on the children
          // as well.
          // First get the height of each child (it is assumed each child has a uniform height)
          scrollProps.childHeight = childScrollProps[0].componentHeight;
        }

        // This function takes a viewport Y value and returns an object containing indicators such
        // as whether the target is inside the component and how far through the component it is.
        // targetY is a value indicating the number of pixels from the top of the viewport the
        // target is located.
        // It will also return information about the targetY relative to the scroll positions of the
        // ScrollinatorChild decorated child items. If the child info is missing then this function
        // returns those properties set to a default value of 0
        scrollProps.getTargetYInfo = (targetY) => {
          return {
            componentIsBelowTarget: scrollProps.componentTopY > targetY,
            // The number of pixels below the component top targetY is
            componentHeightTraversed: targetY - scrollProps.componentTopY,
          };
        };

        // This function takes the targetY value and returns information about it relative to the
        // child components
        scrollProps.getTargetYScrollinatorChildInfo = (targetY) => {
          // The height of each child
          const childHeight = scrollProps.childHeight || 0;

          // The bottom margin of each child. This is based on the distance between targetY and
          // the bottom of the viewport. Will not go any smaller than MIN_CHILD_BOTTOM_MARGIN
          let childMarginBottom = childHeight ?
            Math.floor(scrollProps.viewportHeight - targetY - childHeight) :
            MIN_CHILD_BOTTOM_MARGIN;

          if (childMarginBottom < MIN_CHILD_BOTTOM_MARGIN) {
            childMarginBottom = MIN_CHILD_BOTTOM_MARGIN;
          }

          return {
            childHeight,
            childMarginBottom,
            childFullHeight: childHeight + childMarginBottom,
            // A property that needs to be passed into every child component decorated as a
            // ScrollinatorChild
            childScrollPropsHandler: this.childScrollPropsHandler,
          };

          return {};
        };
      }

      return scrollProps;
    }

    render() {
      const { scrollinatorReady } = this.state;

      if (!scrollinatorReady) {
        return (<div></div>);
      }

      return (
        <ComposedComponent
          {...this.props}
          {...this.getScrollProps()}
        />
      );
    }
  }

);


export default Scrollinator;
