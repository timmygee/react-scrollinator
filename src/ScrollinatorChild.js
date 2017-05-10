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
      const { scrollinatorChildInfo } = this.props;
      const { childScrollPropsHandler } = scrollinatorChildInfo;

      if (childScrollPropsHandler) {
        const componentRect = findDOMNode(this).getBoundingClientRect();

        childScrollPropsHandler({
          componentHeight: componentRect.height,
          componentTopY: componentRect.top,
          componentBottomY: componentRect.bottom,
        });
      } else {
        console.warn(`\
          ScrollinatorChild was not passed a childScrollPropsHandler callback. Behaviour may be \
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
