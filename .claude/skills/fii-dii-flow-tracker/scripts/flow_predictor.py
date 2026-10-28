#!/usr/bin/env python3
"""
FII DII Flow Predictor
Predicts future FII/DII flows based on historical patterns and market conditions
"""

import sys
import os
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Add shared modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))

try:
    from indian_market_utils import IndianMarketUtils
    from nse_data_fetcher import NSEDataFetcher
except ImportError:
    # Fallback for missing dependencies
    print("Warning: Shared utilities not available, using mock implementations")

    class IndianMarketUtils:
        @staticmethod
        def get_current_ist_time():
            return datetime.now()

        @staticmethod
        def is_market_open():
            return True

        @staticmethod
        def get_next_market_open():
            return datetime.now() + timedelta(days=1)

    class NSEDataFetcher:
        def __init__(self):
            pass

        def fetch_fii_dii_data(self, start_date, end_date):
            # Mock data for testing
            dates = pd.date_range(start=start_date, end=end_date, freq='D')
            data = []

            for date in dates:
                if date.weekday() < 5:  # Monday to Friday
                    fii_flow = np.random.normal(1500, 800)
                    dii_flow = np.random.normal(800, 400)

                    data.append({
                        'date': date,
                        'fii_cash_flow': round(fii_flow, 2),
                        'dii_cash_flow': round(dii_flow, 2),
                        'fii_debt_flow': round(np.random.normal(200, 100), 2),
                        'dii_debt_flow': round(np.random.normal(150, 75), 2)
                    })

            return pd.DataFrame(data)


class FII_DII_FlowPredictor:
    """Predicts future FII/DII flows using historical patterns and market conditions"""

    def __init__(self):
        """Initialize the flow predictor"""
        self.utils = IndianMarketUtils()
        self.nse_fetcher = NSEDataFetcher()

        # Prediction models
        self.fii_prediction_model = None
        self.dii_prediction_model = None

        # Historical patterns
        self.seasonal_patterns = self._load_seasonal_patterns()
        self.behavioral_patterns = self._load_behavioral_patterns()

    def predict_flows(self, historical_data: pd.DataFrame, prediction_days: int = 5) -> Dict[str, Any]:
        """
        Predict future FII/DII flows

        Args:
            historical_data: Historical flow data
            prediction_days: Number of days to predict

        Returns:
            Dictionary with flow predictions
        """
        if historical_data.empty or len(historical_data) < 10:
            return {'error': 'Insufficient historical data for prediction'}

        try:
            predictions = {}

            # Prepare data for prediction
            processed_data = self._prepare_prediction_data(historical_data)

            # FII flow predictions
            fii_predictions = self._predict_fii_flows(processed_data, prediction_days)
            predictions['fii_predictions'] = fii_predictions

            # DII flow predictions
            dii_predictions = self._predict_dii_flows(processed_data, prediction_days)
            predictions['dii_predictions'] = dii_predictions

            # Combined predictions
            combined_predictions = self._combine_predictions(fii_predictions, dii_predictions)
            predictions['combined_predictions'] = combined_predictions

            # Prediction confidence
            predictions['confidence_metrics'] = self._calculate_prediction_confidence(
                processed_data, fii_predictions, dii_predictions)

            # Market impact predictions
            predictions['market_impact'] = self._predict_market_impact(combined_predictions)

            return predictions

        except Exception as e:
            print(f"Error predicting flows: {e}")
            return {'error': str(e)}

    def _prepare_prediction_data(self, historical_data: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare historical data for prediction models

        Args:
            historical_data: Raw historical flow data

        Returns:
            Processed data with additional features
        """
        try:
            df = historical_data.copy()

            # Ensure date column is datetime
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')

            # Add technical indicators
            df['fii_ma_5'] = df['fii_cash_flow'].rolling(5).mean()
            df['fii_ma_10'] = df['fii_cash_flow'].rolling(10).mean()
            df['dii_ma_5'] = df['dii_cash_flow'].rolling(5).mean()
            df['dii_ma_10'] = df['dii_cash_flow'].rolling(10).mean()

            # Add momentum indicators
            df['fii_momentum'] = df['fii_cash_flow'] - df['fii_ma_5']
            df['dii_momentum'] = df['dii_cash_flow'] - df['dii_ma_5']

            # Add seasonal features
            df['month'] = df['date'].dt.month
            df['day_of_week'] = df['date'].dt.dayofweek
            df['quarter'] = df['date'].dt.quarter

            # Add lag features
            for lag in [1, 2, 3, 5]:
                df[f'fii_lag_{lag}'] = df['fii_cash_flow'].shift(lag)
                df[f'dii_lag_{lag}'] = df['dii_cash_flow'].shift(lag)

            # Drop rows with NaN values
            df = df.dropna()

            return df

        except Exception as e:
            print(f"Error preparing prediction data: {e}")
            return pd.DataFrame()

    def _predict_fii_flows(self, processed_data: pd.DataFrame, prediction_days: int) -> Dict[str, Any]:
        """
        Predict FII flows using historical patterns

        Args:
            processed_data: Processed historical data
            prediction_days: Number of days to predict

        Returns:
            FII flow predictions
        """
        try:
            predictions = {}

            if len(processed_data) < 5:
                return {'error': 'Insufficient data for FII prediction'}

            # Simple momentum-based prediction
            latest_fii = processed_data['fii_cash_flow'].iloc[-1]
            fii_ma5 = processed_data['fii_ma_5'].iloc[-1]
            fii_momentum = processed_data['fii_momentum'].iloc[-1]

            # Base prediction on recent momentum
            base_prediction = latest_fii + (fii_momentum * 0.7)  # Dampened momentum

            # Apply seasonal adjustments
            seasonal_adjustment = self._get_seasonal_adjustment('fii', prediction_days)
            adjusted_prediction = base_prediction * seasonal_adjustment

            # Generate prediction series
            prediction_dates = []
            prediction_values = []

            current_date = self.utils.get_current_ist_time().date()
            current_prediction = adjusted_prediction

            for i in range(prediction_days):
                pred_date = current_date + timedelta(days=i+1)
                prediction_dates.append(pred_date)

                # Add some randomness and decay
                noise = np.random.normal(0, 200)  # ₹200 Cr standard deviation
                decay_factor = 0.95 ** i  # Predictions decay over time

                daily_prediction = current_prediction * decay_factor + noise
                prediction_values.append(round(daily_prediction, 2))

                # Update for next day (momentum decay)
                current_prediction = daily_prediction * 0.8 + latest_fii * 0.2

            predictions['predicted_dates'] = prediction_dates
            predictions['predicted_values'] = prediction_values
            predictions['average_prediction'] = round(np.mean(prediction_values), 2)
            predictions['prediction_method'] = 'momentum_based'

            return predictions

        except Exception as e:
            print(f"Error predicting FII flows: {e}")
            return {'error': str(e)}

    def _predict_dii_flows(self, processed_data: pd.DataFrame, prediction_days: int) -> Dict[str, Any]:
        """
        Predict DII flows using historical patterns

        Args:
            processed_data: Processed historical data
            prediction_days: Number of days to predict

        Returns:
            DII flow predictions
        """
        try:
            predictions = {}

            if len(processed_data) < 5:
                return {'error': 'Insufficient data for DII prediction'}

            # DII flows are more stable and less volatile
            latest_dii = processed_data['dii_cash_flow'].iloc[-1]
            dii_ma5 = processed_data['dii_ma_5'].iloc[-1]
            dii_momentum = processed_data['dii_momentum'].iloc[-1]

            # DII predictions are more mean-reverting
            base_prediction = (latest_dii * 0.6) + (dii_ma5 * 0.4)  # Weighted average

            # Apply seasonal adjustments
            seasonal_adjustment = self._get_seasonal_adjustment('dii', prediction_days)
            adjusted_prediction = base_prediction * seasonal_adjustment

            # Generate prediction series
            prediction_dates = []
            prediction_values = []

            current_date = self.utils.get_current_ist_time().date()
            current_prediction = adjusted_prediction

            for i in range(prediction_days):
                pred_date = current_date + timedelta(days=i+1)
                prediction_dates.append(pred_date)

                # DII flows have less noise
                noise = np.random.normal(0, 100)  # ₹100 Cr standard deviation
                decay_factor = 0.97 ** i  # Slower decay for DII

                daily_prediction = current_prediction * decay_factor + noise
                prediction_values.append(round(daily_prediction, 2))

                # DII flows are more persistent
                current_prediction = daily_prediction * 0.9 + latest_dii * 0.1

            predictions['predicted_dates'] = prediction_dates
            predictions['predicted_values'] = prediction_values
            predictions['average_prediction'] = round(np.mean(prediction_values), 2)
            predictions['prediction_method'] = 'mean_reverting'

            return predictions

        except Exception as e:
            print(f"Error predicting DII flows: {e}")
            return {'error': str(e)}

    def _combine_predictions(self, fii_predictions: Dict, dii_predictions: Dict) -> Dict[str, Any]:
        """
        Combine FII and DII predictions

        Args:
            fii_predictions: FII flow predictions
            dii_predictions: DII flow predictions

        Returns:
            Combined predictions
        """
        try:
            if 'error' in fii_predictions or 'error' in dii_predictions:
                return {'error': 'Prediction errors in individual flows'}

            combined = {}

            # Combined flow predictions
            fii_values = fii_predictions.get('predicted_values', [])
            dii_values = dii_predictions.get('predicted_values', [])

            if len(fii_values) == len(dii_values):
                combined_values = [f + d for f, d in zip(fii_values, dii_values)]
                combined['predicted_values'] = combined_values
                combined['average_combined'] = round(np.mean(combined_values), 2)

                # Net flow direction
                net_positive_days = sum(1 for v in combined_values if v > 0)
                combined['net_positive_ratio'] = round(net_positive_days / len(combined_values), 2)

            combined['dates'] = fii_predictions.get('predicted_dates', [])

            return combined

        except Exception as e:
            print(f"Error combining predictions: {e}")
            return {'error': str(e)}

    def _get_seasonal_adjustment(self, investor_type: str, days_ahead: int) -> float:
        """
        Get seasonal adjustment factor

        Args:
            investor_type: 'fii' or 'dii'
            days_ahead: Days in the future

        Returns:
            Seasonal adjustment factor
        """
        try:
            current_date = self.utils.get_current_ist_time().date()
            future_date = current_date + timedelta(days=days_ahead)

            # Simple seasonal patterns (can be enhanced with historical data)
            month = future_date.month
            day_of_week = future_date.weekday()

            if investor_type == 'fii':
                # FII patterns: Higher flows in Jan, Apr, Oct
                month_multipliers = {
                    1: 1.2,   # January effect
                    2: 0.9,   # Pre-budget uncertainty
                    3: 1.1,   # Quarter end
                    4: 1.3,   # New financial year
                    5: 0.95,  # Post-budget normalization
                    6: 0.9,   # Monsoon uncertainty
                    7: 0.95,  # Mid-year
                    8: 0.9,   # Pre-festival
                    9: 1.0,   # Quarter end
                    10: 1.2,  # Festival season
                    11: 1.1,  # Post-festival
                    12: 1.0   # Year-end positioning
                }
            else:  # DII
                # DII patterns: More stable, higher in quarter ends
                month_multipliers = {
                    1: 1.0,   # Budget month
                    2: 0.95,  # Pre-budget
                    3: 1.3,   # Quarter end
                    4: 0.9,   # New year adjustment
                    5: 0.95,  # Post-budget
                    6: 1.2,   # Quarter end
                    7: 0.9,   # Mid-year
                    8: 0.95,  # Monsoon
                    9: 1.2,   # Quarter end
                    10: 1.0,  # Festival
                    11: 0.95, # Post-festival
                    12: 1.1   # Year-end
                }

            month_adjustment = month_multipliers.get(month, 1.0)

            # Weekend effect (lower flows on Monday, higher on Friday)
            weekday_multipliers = {
                0: 0.9,   # Monday
                1: 1.0,   # Tuesday
                2: 1.0,   # Wednesday
                3: 1.0,   # Thursday
                4: 1.1,   # Friday
            }

            weekday_adjustment = weekday_multipliers.get(day_of_week, 1.0)

            return month_adjustment * weekday_adjustment

        except Exception:
            return 1.0

    def _calculate_prediction_confidence(self, historical_data: pd.DataFrame,
                                       fii_predictions: Dict, dii_predictions: Dict) -> Dict[str, Any]:
        """
        Calculate confidence metrics for predictions

        Args:
            historical_data: Historical data used for prediction
            fii_predictions: FII predictions
            dii_predictions: DII predictions

        Returns:
            Confidence metrics
        """
        try:
            confidence = {}

            # Historical volatility (lower volatility = higher confidence)
            fii_volatility = historical_data['fii_cash_flow'].std()
            dii_volatility = historical_data['dii_cash_flow'].std()

            # Normalize volatility to confidence score
            max_volatility = 2000  # ₹2000 Cr as max expected volatility
            fii_confidence = max(0, 1 - (fii_volatility / max_volatility))
            dii_confidence = max(0, 1 - (dii_volatility / max_volatility))

            confidence['fii_confidence'] = round(fii_confidence, 2)
            confidence['dii_confidence'] = round(dii_confidence, 2)
            confidence['overall_confidence'] = round((fii_confidence + dii_confidence) / 2, 2)

            # Data quality score
            data_points = len(historical_data)
            confidence['data_quality'] = 'high' if data_points > 50 else 'medium' if data_points > 20 else 'low'

            # Recency factor (more recent data = higher confidence)
            latest_date = historical_data['date'].max()
            days_since_latest = (self.utils.get_current_ist_time().date() - latest_date.date()).days
            recency_score = max(0, 1 - (days_since_latest / 30))  # Decay over 30 days

            confidence['recency_score'] = round(recency_score, 2)

            return confidence

        except Exception as e:
            print(f"Error calculating confidence: {e}")
            return {'error': str(e)}

    def _predict_market_impact(self, combined_predictions: Dict) -> Dict[str, Any]:
        """
        Predict market impact of predicted flows

        Args:
            combined_predictions: Combined flow predictions

        Returns:
            Market impact predictions
        """
        try:
            impact = {}

            if 'error' in combined_predictions:
                return {'error': 'Cannot predict market impact without flow predictions'}

            predicted_values = combined_predictions.get('predicted_values', [])
            if not predicted_values:
                return {'error': 'No prediction values available'}

            # Estimate index impact
            avg_daily_flow = np.mean(predicted_values)
            cumulative_flow = sum(predicted_values)

            # Impact coefficients (based on historical relationships)
            price_impact_per_1000_cr = 0.5  # 0.5% index movement per ₹1000 Cr net flow

            estimated_daily_impact = (avg_daily_flow / 1000) * price_impact_per_1000_cr
            estimated_cumulative_impact = (cumulative_flow / 1000) * price_impact_per_1000_cr

            impact['estimated_daily_impact_pct'] = round(estimated_daily_impact, 2)
            impact['estimated_cumulative_impact_pct'] = round(estimated_cumulative_impact, 2)

            # Direction prediction
            if estimated_cumulative_impact > 1.0:
                impact['market_direction'] = 'strongly_bullish'
            elif estimated_cumulative_impact > 0.3:
                impact['market_direction'] = 'moderately_bullish'
            elif estimated_cumulative_impact < -1.0:
                impact['market_direction'] = 'strongly_bearish'
            elif estimated_cumulative_impact < -0.3:
                impact['market_direction'] = 'moderately_bearish'
            else:
                impact['market_direction'] = 'neutral'

            return impact

        except Exception as e:
            print(f"Error predicting market impact: {e}")
            return {'error': str(e)}

    def _load_seasonal_patterns(self) -> Dict[str, Any]:
        """
        Load seasonal patterns for flow prediction

        Returns:
            Seasonal pattern data
        """
        # This would typically load from historical data
        # For now, return mock patterns
        return {
            'fii': {
                'january_effect': 1.2,
                'april_effect': 1.3,
                'october_effect': 1.2,
                'weekend_effect': 0.9
            },
            'dii': {
                'quarter_end_effect': 1.3,
                'year_end_effect': 1.1,
                'stability_factor': 0.8
            }
        }

    def _load_behavioral_patterns(self) -> Dict[str, Any]:
        """
        Load behavioral patterns for flow prediction

        Returns:
            Behavioral pattern data
        """
        # This would typically load from historical analysis
        return {
            'fii': {
                'momentum_factor': 0.7,
                'mean_reversion': 0.3,
                'volatility_response': 0.8
            },
            'dii': {
                'momentum_factor': 0.4,
                'mean_reversion': 0.6,
                'volatility_response': 0.5
            }
        }

    def generate_prediction_report(self, days: int = 30, prediction_days: int = 5) -> str:
        """
        Generate a comprehensive flow prediction report

        Args:
            days: Historical days to analyze
            prediction_days: Days to predict

        Returns:
            Formatted prediction report
        """
        try:
            # Fetch historical data
            end_date = self.utils.get_current_ist_time().date()
            start_date = end_date - timedelta(days=days)

            historical_data = self.nse_fetcher.fetch_fii_dii_data(start_date, end_date)

            if historical_data.empty:
                return "Unable to fetch historical data for predictions"

            # Generate predictions
            predictions = self.predict_flows(historical_data, prediction_days)

            if 'error' in predictions:
                return f"Prediction Error: {predictions['error']}"

            # Generate report
            report = []
            report.append("=" * 70)
            report.append("FII DII FLOW PREDICTION REPORT")
            report.append("=" * 70)
            report.append(f"Historical Period: Last {days} days")
            report.append(f"Prediction Horizon: Next {prediction_days} days")
            report.append(f"Report Generated: {self.utils.get_current_ist_time().strftime('%Y-%m-%d %H:%M:%S IST')}")
            report.append("")

            # FII Predictions
            fii_pred = predictions.get('fii_predictions', {})
            if 'error' not in fii_pred:
                report.append("FII FLOW PREDICTIONS:")
                report.append("-" * 40)
                report.append(f"Average Daily Prediction: ₹{fii_pred.get('average_prediction', 0):,.0f} Cr")
                report.append(f"Prediction Method: {fii_pred.get('prediction_method', 'N/A')}")
                report.append("")

            # DII Predictions
            dii_pred = predictions.get('dii_predictions', {})
            if 'error' not in dii_pred:
                report.append("DII FLOW PREDICTIONS:")
                report.append("-" * 40)
                report.append(f"Average Daily Prediction: ₹{dii_pred.get('average_prediction', 0):,.0f} Cr")
                report.append(f"Prediction Method: {dii_pred.get('prediction_method', 'N/A')}")
                report.append("")

            # Combined Predictions
            combined_pred = predictions.get('combined_predictions', {})
            if 'error' not in combined_pred:
                report.append("COMBINED FLOW PREDICTIONS:")
                report.append("-" * 40)
                report.append(f"Average Net Daily Flow: ₹{combined_pred.get('average_combined', 0):,.0f} Cr")
                report.append(f"Positive Flow Ratio: {combined_pred.get('net_positive_ratio', 0):.1%}")
                report.append("")

            # Confidence Metrics
            confidence = predictions.get('confidence_metrics', {})
            if 'error' not in confidence:
                report.append("PREDICTION CONFIDENCE:")
                report.append("-" * 40)
                report.append(f"FII Prediction Confidence: {confidence.get('fii_confidence', 0):.1%}")
                report.append(f"DII Prediction Confidence: {confidence.get('dii_confidence', 0):.1%}")
                report.append(f"Overall Confidence: {confidence.get('overall_confidence', 0):.1%}")
                report.append(f"Data Quality: {confidence.get('data_quality', 'N/A').upper()}")
                report.append("")

            # Market Impact
            impact = predictions.get('market_impact', {})
            if 'error' not in impact:
                report.append("EXPECTED MARKET IMPACT:")
                report.append("-" * 40)
                report.append(f"Daily Index Impact: {impact.get('estimated_daily_impact_pct', 0):+.1f}%")
                report.append(f"Cumulative Impact: {impact.get('estimated_cumulative_impact_pct', 0):+.1f}%")
                report.append(f"Market Direction: {impact.get('market_direction', 'N/A').upper()}")
                report.append("")

            report.append("DISCLAIMER:")
            report.append("-" * 40)
            report.append("Predictions are based on historical patterns and should not be")
            report.append("considered as financial advice. Actual flows may vary significantly.")
            report.append("")

            report.append("=" * 70)

            return "\n".join(report)

        except Exception as e:
            return f"Error generating prediction report: {e}"


def main():
    """Main function for command-line usage"""
    predictor = FII_DII_FlowPredictor()

    # Generate prediction report
    report = predictor.generate_prediction_report(30, 5)
    print(report)


if __name__ == "__main__":
    main()
