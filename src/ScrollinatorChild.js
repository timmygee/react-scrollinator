import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';


const ScrollinatorChild = (ComposedComponent) => (

  class extends Component {
    constructor(props) {
      super(props);

      this.sendScrollProps = this.sendScrollProps.bind(this);
    }

    componentDidMount() {
      this.sendScrollProps();
    }

    sendScrollProps() {
      const { scrollinatorChildInfo, imgUrl } = this.props;
      const { childItemsPropsHandler, targetY } = scrollinatorChildInfo;

      if (childItemsPropsHandler) {
        const componentRect = findDOMNode(this).getBoundingClientRect();

        childItemsPropsHandler({
          componentHeight: componentRect.height,
          componentTopY: componentRect.top,
          componentBottomY: componentRect.bottom,
          targetY,
          imgUrl,
        });
      } else {
        console.warn(`\
          ScrollinatorChild was not passed a childItemsPropsHandler callback. Behaviour may be \
          unpredictable`
        );
      }
    }

    render() {
      const { scrollinatorChildInfo, ...rest } = this.props;
      const { childMarginBottom } = scrollinatorChildInfo;

      const style = {
        marginBottom: `${childMarginBottom}px`,
      };

      return (
        <div style={style}>
          <ComposedComponent {...rest} />
        </div>
      );
    }
  }

);


export default ScrollinatorChild;
