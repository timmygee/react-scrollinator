import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';


const MIN_CHILD_BOTTOM_MARGIN = 70;


const Scrollinator = (ComposedComponent) => (

  class extends Component {
    constructor(props) {
      super(props);

      this.state = {
        documentRect: null,
        componentRect: null,
        scrollinatorReady: false,
        childItemsProps: [],
      };

      this.handleScroll = this.handleScroll.bind(this);
      this.savePositions = this.savePositions.bind(this);
      this.getScrollProps = this.getScrollProps.bind(this);
      this.childItemsPropsHandler = this.childItemsPropsHandler.bind(this);
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

    childItemsPropsHandler(scrollProps) {
      const { childItemsProps } = this.state;
      childItemsProps.push(scrollProps);
      this.setState({ ...this.state, childItemsProps });
    }

    getScrollProps() {
      const { documentRect, componentRect, scrollinatorReady, childItemsProps } = this.state;

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

        // This function takes a viewport Y value and returns an object containing indicators such
        // as whether the target is inside the component and how far through the component it is.
        // targetY is a value indicating the number of pixels from the top of the viewport the
        // target is located.
        scrollProps.getTargetYInfo = (targetY) => {
          return {
            componentIsBelowTarget: scrollProps.componentTopY > targetY,
            // The number of pixels below the component top targetY is
            componentHeightTraversed: targetY - scrollProps.componentTopY,
          };
        };

        if (childItemsProps.length) {
          // If we have got the ScrollinatorChild properties sent back via the
          // childItemsPropsHandler callback then we can perform calculations based on the children
          // as well.
          // First get the height of each child (it is assumed each child has a uniform height)
          scrollProps.childHeight = childItemsProps[0].componentHeight;
          // The number of child items in the scroll animation
          scrollProps.numChildItems = childItemsProps.length;
        }

        // This function takes the targetY value and returns information about it relative to the
        // child components
        scrollProps.getScrollinatorChildInfo = (targetY) => {
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

          // The full height of each child component including margin
          const childFullHeight = childHeight + childMarginBottom;

          // The current Y position of the last child
          const lastChildY = scrollProps.componentTopY +
            (childFullHeight * (childItemsProps.length - 1));

          // Indicates if the target is below the top of the last child item Y
          const targetIsBelowLastChildY = targetY > lastChildY;

          // Evaluate non child related targetY relative info
          const targetYInfo = scrollProps.getTargetYInfo(targetY);

          // We consider the current child background image Y to be "pinned" to the targetY if the
          // target is inside any child item except for the last
          const childBgIsPinned =
            !targetYInfo.componentIsBelowTarget && !targetIsBelowLastChildY;

          let childBgY;

          if (childBgIsPinned) {
            // If background is considered pinned then the child bg image should be at the same Y
            // index as the target
            childBgY = targetY;
          } else if (targetIsBelowLastChildY) {
            // If the target is inside or below the last child item then the background should be
            // the same Y index as the top of the last child
            childBgY = lastChildY;
          } else {
            // The bg image should follow the top of the scrollinated component
            childBgY = scrollProps.componentTopY;
          }

          // Determine the activeChildIndex from the progress of the target through the scrollinated
          // component
          let activeChildIndex = 0

          if (targetYInfo.componentHeightTraversed > 0) {
            activeChildIndex = Math.floor(targetYInfo.componentHeightTraversed / childFullHeight)

            if (activeChildIndex > childItemsProps.length - 1) {
              activeChildIndex = childItemsProps.length - 1;
            }
          }

          // Determine the number of pixels below the active child the the target is
          const activeChildHeightTraversed =
            targetYInfo.componentHeightTraversed - childFullHeight * activeChildIndex;

          // Generate a number between 0 and 1 indicating how far through the active child the
          // target has currently traversed
          const activeChildTraversalRatio = activeChildHeightTraversed > 0 ?
            activeChildHeightTraversed / childFullHeight :
            0;

          return {
            childHeight,
            childMarginBottom,
            childFullHeight,
            lastChildY,
            targetIsBelowLastChildY,
            childBgIsPinned,
            childBgY,
            activeChildIndex,
            activeChildHeightTraversed,
            activeChildTraversalRatio,
            // A property that needs to be passed into every child component decorated as a
            // ScrollinatorChild
            childItemsPropsHandler: this.childItemsPropsHandler,
            // hand back the targetY also
            targetY,
          };

          return {};
        };
      }

      return scrollProps;
    }

    render() {
      const { scrollinatorReady, childItemsProps } = this.state;

      if (!scrollinatorReady) {
        return <div></div>;
      }

      const scrollProps = this.getScrollProps();

      let bgSection = null;

      if (childItemsProps.length) {
        // targetY is passed into each childItemsProps callback so we can determine its value by
        // inspecting the props representing the first child
        const { targetY } = childItemsProps[0];

        // Now we have targetY we can access all the calculations for the children items
        const { getScrollinatorChildInfo } = scrollProps;
        const {
          targetYScrollinatorChildInfo,
          childBgY,
          activeChildIndex,
          activeChildTraversalRatio
        } = getScrollinatorChildInfo(targetY);

        bgSection = (
          <div className='scrollinator-underlay'>
            {
              childItemsProps.map((item, index) => {
                const childBgStyles = {
                  childBg: {
                    top: `${childBgY}px`,
                  }
                }

                if (index === activeChildIndex && index < (childItemsProps.length - 1)) {
                  childBgStyles.childBg.opacity = 1 - activeChildTraversalRatio;
                } else if (index === activeChildIndex + 1) {
                  childBgStyles.childBg.opacity = activeChildTraversalRatio;
                }

                return (
                  <div
                    key={index}
                    className={
                      classNames(
                        'child-bg',
                        { 'active': index === activeChildIndex }
                      )
                    }
                    style={childBgStyles.childBg}
                  >
                    <div className='child-bg-dots-aligner'>
                      <div className='container'>
                        <div className='child-bg-dots'>
                          {
                            childItemsProps.map((_, dotIndex) => (
                              <div key={`child-bg-dot${dotIndex}`}
                                className={
                                  classNames(
                                    'child-bg-dot',
                                    { 'active': dotIndex === activeChildIndex }
                                  )
                                }
                                />
                            ))
                          }
                        </div>
                      </div>
                    </div>
                    <img
                      src={childItemsProps[index].imgUrl.replace(/(\.\w+)$/, '@2x$1')}
                      />
                  </div>
                );
              })
            }
          </div>
        );
      }

      return (
        <div className="scrollinator">
          <ComposedComponent
            {...this.props}
            {...scrollProps}
          />
          { bgSection }
        </div>
      );
    }
  }

);


export default Scrollinator;
