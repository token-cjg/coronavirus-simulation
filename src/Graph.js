import React, { Component } from "react";
import { MAX_ITERATES } from "./constants";


import {
  forceSimulation,
  forceLink,
  forceCollide
} from "d3-force";

import Node from "./Node";

export default class Graph extends Component {
  constructor(props) {
    super(props);

    this.handleTick = this.handleTick.bind(this);
    this.setCurrent = this.setCurrent.bind(this);

    this.state = {
      current: null,
      iteration: 0,
      is_running: true,
      layout: props.nodes.reduce(
        (prev, acc) => (
          (prev[acc.id] = {
            x: 0,
            y: 0
          }),
          prev
        ),
        {}
      )
    };
  }

  componentDidMount() {}

  componentWillMount() {
    this.runForceSimulation();
    this.simulation.on("tick", this.handleTick);
  }

  componentWillUnmount() {
    this.simulation.on("tick", null);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tick !== nextProps.tick) {
      this.updateForceSimulation();
    }
  }

  updateForceSimulation() {
    this.simulation.alpha(0.2).restart();
    this.simulation.nodes(this.props.nodes);
    this.simulation.force("link").links(this.props.edges);
  }

  shouldComponentUpdate(props, nextProps) {
    const { layout, iteration, is_running } = this.state;
    if (is_running) {
      return props.tick !== nextProps.tick;
    } else {
      return false;
    }
  }

  runForceSimulation() {
    const { nodes, edges, is_running } = this.props;
    let simulation;
    simulation = (this.simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink().id(node => node.id)
      )
      .force(
        "collide",
        forceCollide(() => 1)
          .iterations(1)
          .radius(9)
      ));

    simulation
      .force("link")
      .links(edges)
      .distance(25);
  }

  handleTick() {
    const { simulation } = this;
    const { layout, iteration, is_running } = this.state;
    let updates = {};

    // console.log("Iteration is", iteration);
    if (iteration >= MAX_ITERATES) {
      console.log("Iteration count exceeded, stopping force simulation.");

      // stop the simulation
      this.simulation.stop();

      // set is_running to "off"
      this.setState({
        layout: { ...layout, ...updates },
        iteration: iteration,
        is_running: false
      })
    }
    else {
      simulation.nodes().map(node => {
        updates[node.id] = node;
      });

      this.setState({
        layout: {
          ...layout,
          ...updates
        },
        iteration: iteration + 1,
        is_running: is_running
      });
    }
  }

  setCurrent(nodeId) {
    return () => {
      this.setState({
        current: nodeId
      });
    };
  }

  render() {
    const { nodes, edges, width, height, onNodeClick } = this.props;
    const { layout, current } = this.state;
    return (
      <svg
        width={width}
        ref={ref => (this.svgRef = ref)}
        height={height}
        style={{
          shapeRendering: "geometricPrecision"
        }}
      >
        {nodes.map((node, index) => (
          <Node
            key={index}
            node={node}
            layout={layout}
            current={current}
            width={width}
            height={height}
            onNodeClick={onNodeClick}
            {...node}
          />
        ))}
      </svg>
    );
  }
}

Graph.defaultProps = {
  width: 900,
  height: 600,
  nodes: [],
  edges: []
};
