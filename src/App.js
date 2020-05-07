import React, { useEffect, useState, useRef } from "react";

import styles from "./App.module.css";
import Graph from "./Graph";
import LineChart from "./LineChart";
import SimulationSettings from "./SimulationSettings";
import { SICK, RECOVERED, DEAD, VACCINATED } from "./constants";
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
  const [loading, setLoading] = useState(true);

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
    setHistoricalRecoveredCount([]);
    setHistoricalSickCount([]);
    setHistoricalVaccinatedCount([]);
    setSimulationState({ ...simulationState, tick: 0 });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>What’s the effect of vaccination on how a virus spreads through a community?</h3>
        <h2>An experiment to analyse how a virus spread over a community</h2>
      </div>
      <div className={styles.simulation}>
        <div className={styles.samples}>
          <span className={styles.sampleSusceptible}>Susceptible</span>
          <span className={styles.sampleInfected}>Infected</span>
          <span className={styles.sampleRecovered}>Recovered</span>
          <span className={styles.sampleVaccinated}>Vaccinated</span>
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
            onNodeClick={onNodeClick}
            ref={graphRef}
          />
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.stats}>
          <h3>Stats</h3>
          <div className={styles.population}>
            POPULATION: {nodes.filter(({ type }) => type === "agent").length}{" "}
            <br />
            DEAD: {nodes.filter(({ state }) => state === DEAD).length} <br />
            RECOVERED: {
              nodes.filter(({ state }) => state === RECOVERED).length
            }{" "}
            <br />
            SICK: {nodes.filter(({ state }) => state === SICK).length} <br />
            VACCINATED: {nodes.filter(({ state }) => state === VACCINATED).length} <br />
          </div>
          <LineChart
            width={300}
            height={270}
            data={[
              { color: "red", points: historicalSickCount },
              { color: "green", points: historicalRecoveredCount },
              { color: "black", points: historicalDeadCount },
              { color: "blue", points: historicalVaccinatedCount },
            ]}
          />
        </div>
        <div className={styles.simulationSettings}>
          <h3>Settings</h3>
          <div className={styles.simulationInfo}>
            How we will set up our experiment?
            <p>
              The only change that you will need to make is to the initial vaccinated
              slider in the simulation. You will need to run the experiment three times
              in total under the following settings:
            </p>
            <p>
              0%,
              50% and
              95% initial vaccinated people.
            </p>
            <p>
              You can reset the simulation each time by clicking restart the simulation.
            </p>

          </div>
          <SimulationSettings
            simulationState={simulationState}
            onSettingChange={onSettingChange}
            onRestartButtonClick={onRestartButtonClick}
          />
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






          <h3>What is observable? - Dependent variables</h3>
          <p>
          The simulation will allow you to observe a number of variables as you
          watch what happens over 100 days. You will be able to see:
            <ul>
              <li>how many people get infected / die / recover</li>
              <li>how quickly the virus spreads</li>
            </ul>
          </p>
          <h3>What can we change? - Independent variables</h3>
          <p>
            You will be able to make changes to how many people are vaccinated
            at the start of the experiment.
          </p>
          <h1>I would like to discover more</h1>
          <p>
            This is an MIT-licensed open-source project, you can find the source
            code on github.
          </p>
          <p>
            <a href="https://github.com/fatiherikli/coronavirus-simulation">
              https://github.com/fatiherikli/coronavirus-simulation
            </a>
          </p>

          <p style={{ marginBottom: "4em" }}>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
