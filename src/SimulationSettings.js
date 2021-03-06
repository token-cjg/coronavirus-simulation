import React from 'react';

import styles from './SimulationSettings.module.css';

export default function SimulationSettings({
  simulationState,
  onSettingChange,
  onRestartButtonClick,
}) {
  return (
    <div className={ styles.container }>
      <div className={ styles.form }>
      <label>
        Percentage initial vaccinated people<br />
        <input
          type={ 'range' }
          onChange={ onSettingChange('percentageInitialVaccinatedAgents') }
          value={ simulationState.percentageInitialVaccinatedAgents }
          min={ 0 }
          max={ 95 }
        /> <span className={ styles.value }>{ simulationState.percentageInitialVaccinatedAgents }</span>
      </label>
      </div>

      <div className={ styles.footer }>
        <button onClick={ onRestartButtonClick }>Restart the simulation</button>
      </div>
    </div>
  );
}
