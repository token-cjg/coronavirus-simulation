import React, { useEffect, useState, useRef } from "react";

import styles from "./App.module.css";
import Graph from "./Graph";
import LineChart from "./LineChart";
import SimulationSettings from "./SimulationSettings";
import { SICK, RECOVERED, DEAD, VACCINATED, SUSCEPTIBLE, MAX_ITERATES } from "./constants";
import { useInterval, randomChoice } from "./utils";
import { nextSimulationTick, getInitialGraph } from "./simulation";

const INITIAL_SIMULATION_STATE = {
  tick: 0,
  agentsPerHouse: 9,
  houses: 42,
  busStations: 1,
  hospitals: 1,
  supermarkets: 3,
  temples: 1,
  initialSickAgents: 3,
  percentageInitialVaccinatedAgents: 30
};

const INITIAL_GRAPH = getInitialGraph(INITIAL_SIMULATION_STATE);

function App() {
  const [simulationState, setSimulationState] = useState(
    INITIAL_SIMULATION_STATE
  );
  const [nodes, setNodes] = useState(INITIAL_GRAPH.nodes);
  const [edges, setEdges] = useState(INITIAL_GRAPH.edges);
  const [historicalSickCount, setHistoricalSickCount] = useState([]);
  const [historicalRecoveredCount, setHistoricalRecoveredCount] = useState([]);
  const [historicalDeadCount, setHistoricalDeadCount] = useState([]);
  const [historicalVaccinatedCount, setHistoricalVaccinatedCount] = useState([]);
  const [historicalMaxInfected, setHistoricalMaxInfected] = useState([]);
  const [historicalDayMaxInfected, setHistoricalDayMaxInfected] = useState([]);
  const [loading, setLoading] = useState(true);
  let sirModelIterate

  const graphRef = useRef(null);

  useInterval(() => {
    if (loading) {
      return;
    }

    const { nodes: _nodes, edges: _edges, state } = nextSimulationTick(
      simulationState,
      nodes,
      edges
    );

    sirModelIterate = state.tick;

    if (sirModelIterate < MAX_ITERATES) {
      setSimulationState(state);

      setHistoricalSickCount(
        historicalSickCount.concat(
          nodes.filter(({ state }) => state === SICK).length
        )
      );

      setHistoricalRecoveredCount(
        historicalRecoveredCount.concat(
          nodes.filter(({ state }) => state === RECOVERED).length
        )
      );

      setHistoricalDeadCount(
        historicalDeadCount.concat(
          nodes.filter(({ state }) => state === DEAD).length
        )
      );

      setHistoricalVaccinatedCount(
        historicalVaccinatedCount.concat(
          nodes.filter(({ state }) => state === VACCINATED).length
        )
      );
    }
    if (nodes.filter(({ state }) => state === SICK).length > historicalMaxInfected) {
      setHistoricalMaxInfected([nodes.filter(({ state }) => state === SICK).length])
      setHistoricalDayMaxInfected(simulationState.tick)
    }
  }, 1000);

  useEffect(() => {
    setLoading(false);
  }, [loading]);

  const onNodeClick = (nodeId) => {
    return () => {};
  };

  const onSettingChange = (key) => (event) => {
    setSimulationState({ ...simulationState, [key]: event.target.value });
  };

  const onRestartButtonClick = () => {
    const { nodes, edges } = getInitialGraph(simulationState);
    setLoading(true);
    setNodes(nodes);
    setEdges(edges);
    setHistoricalDeadCount([]);
    setHistoricalMaxInfected([]);
    setHistoricalDayMaxInfected([]);
    setHistoricalRecoveredCount([]);
    setHistoricalSickCount([]);
    setHistoricalVaccinatedCount([]);
    setSimulationState({ ...simulationState, tick: 0 });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>What’s the effect of vaccination on how a virus spreads through a community?</h3>
        <h2>An experiment to analyse how a virus spreads through a community</h2>
      </div>
      <div className={styles.simulation}>
        <div className={styles.samples}>
          <span className={styles.sampleSusceptible}>Susceptible</span>
          <span className={styles.sampleInfected}>Infected</span>
          <span className={styles.sampleRecovered}>Recovered</span>
          <span className={styles.sampleVaccinated}>Vaccinated</span>
          <span className={styles.sampleDead}>Deceased</span>
        </div>
        {!loading && (
          <Graph
            width={
              Math.round(
                nodes.filter(({ type }) => type === "venue").length / 6
              ) * 110
            }
            height={700}
            tick={simulationState.tick}
            nodes={nodes}
            edges={edges}
            sirModelIterate={sirModelIterate}
            onNodeClick={onNodeClick}
            ref={graphRef}
          />
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.stats}>
          <h3>Statistics</h3>
          <div className={styles.population}>
            POPULATION: {nodes.filter(({ type }) => type === "agent").length}{" "}
            <br />
            VACCINATED: {nodes.filter(({ state }) => state === VACCINATED).length} <br />
            SUSCEPTIBLE: {nodes.filter(({ state }) => state === SUSCEPTIBLE).length} <br />
            <br />
            <span class={styles.blackCircle}></span> DECEASED: {nodes.filter(({ state }) => state === DEAD).length} <br />
            <span class={styles.recoveredCircle}></span> RECOVERED: {
              nodes.filter(({ state }) => state === RECOVERED).length
            }{" "}
            <br />
            <span class={styles.infectedCircle}></span> INFECTED: {nodes.filter(({ state }) => state === SICK).length} <br />
            <br />
            TOTAL CONFIRMED CASES: {nodes.filter(({ state }) => state === SICK || state === DEAD || state === RECOVERED).length} <br /><br />
            NUMBER INFECTED AT PEAK: {historicalMaxInfected} <br />
            DAY OF PEAK INFECTION: {historicalDayMaxInfected+1} <br />
           <p>
           DAY COUNTER: {simulationState.tick+1} <br />
           </p>
          </div>

          <LineChart
            width={300}
            height={270}
            data={[
              { color: "red", points: historicalSickCount },
              { color: "green", points: historicalRecoveredCount },
              { color: "black", points: historicalDeadCount },
            ]}
          />
        </div>
        <div className={styles.simulationSettings}>
          <h3>Settings</h3>
          <SimulationSettings
            simulationState={simulationState}
            onSettingChange={onSettingChange}
            onRestartButtonClick={onRestartButtonClick}
          />
          <div className={styles.simulationInfo}>
            <h3> Method: </h3>
            <p><b>You will run three experiments:</b> where the initial number vaccinated are 0%, 50% and 95% and record data from the experiments on <b>Table 1</b> and <b>Table 2</b> of your worksheet. </p>
            <p> Use the slider bar in the simulation to enter the initial percentage of population that are vaccinated as indicated in <b>Table 1</b>, then run the simulation and then record the final numbers for <b>susceptible</b>,  <b>deceased</b>, <b>recovered</b> and <b>infected</b> after 100 days in <b>Table 1</b>. </p>
            <p> Record the number of infected at peak, and time in days to reach peak in <b>Table 2</b>. </p>
            <p> Repeat the experiment for each percentage of initially vaccinated people. </p>
          </div>
        </div>

      </div>
      <div className={styles.pageInfo}>
      <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-5587173855104127"
          data-ad-slot="8487596319"
        ></ins>
        <div className={styles.section}>
          <h3>The code for this simulation</h3>
          <p>We would like to acknowledge Fatih Erikli who developed the original code behind this simulation. A big thank you to Chris Goddard for donating his time and helping us develop the simulation used in this experiment.</p>
          <p>This is an MIT-licensed open-source project, you can find the source for the  <a href="https://github.com/fatiherikli/coronavirus-simulation"> original </a> and <a href="https://github.com/token-cjg/coronavirus-simulation"> modified </a> code on github. Feel free to copy, use or modify it for your own simulations.</p>
          <p style={{ marginBottom: "4em" }}></p>
        </div>
      </div>
    </div>
  );
}

export default App;
