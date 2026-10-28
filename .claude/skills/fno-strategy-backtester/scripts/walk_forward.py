"""Walk-Forward Optimization Framework — NotSoSEBI."""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Callable
from itertools import product


class WalkForward:
    """Walk-forward optimization framework for robust strategy validation."""

    def __init__(self):
        self.best_params = None

    def split_data(self, df: pd.DataFrame, in_sample_pct: float = 0.7) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split data into in-sample and out-of-sample periods."""
        split_idx = int(len(df) * in_sample_pct)
        return df.iloc[:split_idx].copy(), df.iloc[split_idx:].copy()

    def optimize(self, param_grid: Dict[str, List], strategy_func: Callable, data: pd.DataFrame) -> Dict[str, Any]:
        """Run grid search optimization on in-sample data."""
        best_score, best_params = -np.inf, None
        for params in product(*param_grid.values()):
            param_dict = dict(zip(param_grid.keys(), params))
            score = strategy_func(param_dict, data)
            if score > best_score:
                best_score, best_params = score, param_dict
        self.best_params = best_params
        return {'best_params': best_params, 'best_score': best_score}

    def validate(self, best_params: Dict[str, Any], strategy_func: Callable, oos_data: pd.DataFrame) -> Dict[str, Any]:
        """Validate best parameters on out-of-sample data."""
        oos_score = strategy_func(best_params, oos_data)
        return {'oos_score': oos_score, 'params': best_params}

    def run_rolling(self, df: pd.DataFrame, strategy_func: Callable, param_grid: Dict[str, List],
                   window_size: int, step_size: int) -> List[Dict[str, Any]]:
        """Run rolling walk-forward optimization."""
        results = []
        for start_idx in range(0, len(df) - window_size + 1, step_size):
            window_data = df.iloc[start_idx:start_idx + window_size]
            is_data, oos_data = self.split_data(window_data)
            opt_result = self.optimize(param_grid, strategy_func, is_data)
            val_result = self.validate(opt_result['best_params'], strategy_func, oos_data)
            results.append({'window_start': df.index[start_idx], 'best_params': opt_result['best_params'],
                          'is_score': opt_result['best_score'], 'oos_score': val_result['oos_score']})
        return results
