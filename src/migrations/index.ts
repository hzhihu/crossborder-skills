import * as migration_20261109_143544_initial from './20261109_143544_initial';
import * as migration_20261109_144219_add_payload_jobs from './20261109_144219_add_payload_jobs';
import * as migration_20261109_154324_phase_2_core_models from './20261109_154324_phase_2_core_models';
import * as migration_20261109_161638_phase_2_source_constraints from './20261109_161638_phase_2_source_constraints';
import * as migration_20261110_001032_review_round_1_sorting from './20261110_001032_review_round_1_sorting';

export const migrations = [
  {
    up: migration_20261109_143544_initial.up,
    down: migration_20261109_143544_initial.down,
    name: '20261109_143544_initial',
  },
  {
    up: migration_20261109_144219_add_payload_jobs.up,
    down: migration_20261109_144219_add_payload_jobs.down,
    name: '20261109_144219_add_payload_jobs',
  },
  {
    up: migration_20261109_154324_phase_2_core_models.up,
    down: migration_20261109_154324_phase_2_core_models.down,
    name: '20261109_154324_phase_2_core_models',
  },
  {
    up: migration_20261109_161638_phase_2_source_constraints.up,
    down: migration_20261109_161638_phase_2_source_constraints.down,
    name: '20261109_161638_phase_2_source_constraints',
  },
  {
    up: migration_20261110_001032_review_round_1_sorting.up,
    down: migration_20261110_001032_review_round_1_sorting.down,
    name: '20261110_001032_review_round_1_sorting'
  },
];
