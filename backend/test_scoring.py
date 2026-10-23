import pandas as pd
import scoring


def candles(closes):
    return pd.DataFrame({"c": closes, "h": [c * 1.01 for c in closes], "v": [1000] * len(closes)})


def test_uptrend_scores_high():
    s = scoring.tech(candles([100 + i for i in range(120)]))
    assert s["score"] >= 40 and s["checks"][0]["ok"]


def test_short_history_is_zero():
    assert scoring.tech(candles([1, 2, 3]))["score"] == 0


def test_fund_missing_data_does_not_crash():
    f = scoring.fund([], [], None, None, None)
    assert 0 <= f["score"] <= 100 and f["profit_yoy"] is None


def test_fund_growth_yoy():
    f = scoring.fund([100, 100, 100, 100, 120], [10, 10, 10, 10, 15], 20, .5, 18)
    assert abs(f["profit_yoy"] - .5) < 1e-9 and f["score"] > 60
