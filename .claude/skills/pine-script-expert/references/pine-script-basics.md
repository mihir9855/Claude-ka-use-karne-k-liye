# Pine Script Fundamentals

## Core Concepts

### Script Structure
Pine Script follows a specific structure for creating indicators and strategies:

```pinescript
//@version=5
indicator("My Indicator", overlay=true)

// Inputs
length = input.int(14, "Length", minval=1)

// Calculations
myValue = ta.sma(close, length)

// Plot
plot(myValue, color=color.blue, title="SMA")
```

### Key Components
- **Version Declaration**: `@version=5` for latest features
- **Script Type**: `indicator()` or `strategy()`
- **Inputs**: User-configurable parameters
- **Calculations**: Technical analysis functions
- **Outputs**: Plots, alerts, or trading signals

## Data Types

### Primitive Types
- **int**: Integer values (-2,147,483,648 to 2,147,483,647)
- **float**: Floating-point numbers (64-bit precision)
- **bool**: Boolean values (true/false)
- **string**: Text values (up to 4096 characters)
- **color**: Color values with transparency

### Series Types
- **series int/float/bool**: Time series data
- **series color**: Dynamic color series
- **series string**: Text series for labels

### Special Types
- **na**: Not Available (missing data)
- **void**: No return value
- **const**: Compile-time constants

## Built-in Functions

### Technical Analysis
```pinescript
// Moving Averages
ta.sma(source, length)      // Simple Moving Average
ta.ema(source, length)      // Exponential Moving Average
ta.wma(source, length)      // Weighted Moving Average
ta.hma(source, length)      // Hull Moving Average

// Oscillators
ta.rsi(source, length)      // Relative Strength Index
ta.macd(source, fast, slow, signal)  // MACD
ta.stoch(close, high, low, length)   // Stochastic

// Volatility
ta.atr(length)              // Average True Range
ta.bb(close, timeperiod, nbdev)  // Bollinger Bands
```

### Mathematical Functions
```pinescript
math.abs(x)          // Absolute value
math.sqrt(x)         // Square root
math.pow(base, exp)  // Power function
math.log(x)          // Natural logarithm
math.max(a, b)       // Maximum of two values
math.min(a, b)       // Minimum of two values
math.round(x)        // Round to nearest integer
```

### Statistical Functions
```pinescript
ta.dev(source, length)      // Standard deviation
ta.correlation(x, y, length) // Correlation coefficient
ta.covariance(x, y, length)  // Covariance
ta.percentile_linear(source, length, percentage)
ta.percentile_nearest_rank(source, length, percentage)
```

## Control Structures

### Conditional Statements
```pinescript
if condition
    // code block
else if another_condition
    // code block
else
    // code block
```

### Loops
```pinescript
for i = 0 to 10
    // loop body

// While loop
bool condition = true
while condition
    // loop body
    condition := false
```

### Switch Statement
```pinescript
switch value
    1 => "One"
    2 => "Two"
    => "Other"  // default case
```

## Variable Declaration

### Standard Variables
```pinescript
int myInt = 10
float myFloat = 10.5
bool myBool = true
string myString = "Hello"
color myColor = color.green
```

### Series Variables
```pinescript
series[float] sma = ta.sma(close, 14)
series[bool] bullish = close > sma
```

### Mutable Variables
```pinescript
var int counter = 0          // Resets on each bar
var int persistent = 0       // Persists across bars
```

## Input Functions

### Basic Inputs
```pinescript
length = input.int(14, "Length", minval=1, maxval=100)
multiplier = input.float(2.0, "Multiplier", step=0.1)
showPlot = input.bool(true, "Show Plot")
timeframe = input.timeframe("D", "Timeframe")
```

### Advanced Inputs
```pinescript
maType = input.string("SMA", "MA Type", options=["SMA", "EMA", "WMA"])
colorScheme = input.color(color.blue, "Color")
group = input.group("Moving Average Settings")
```

## Plotting Functions

### Basic Plots
```pinescript
plot(sma, color=color.blue, title="SMA", linewidth=2)
plotshape(bullish, style=shape.triangleup, location=location.belowbar, color=color.green, size=size.small)
plotchar(condition, char="▲", location=location.belowbar, color=color.green)
```

### Advanced Plots
```pinescript
hline(100, "Reference Line", color=color.gray)
fill(plot1, plot2, color=color.new(color.blue, 90), title="Fill")
bgcolor(condition ? color.new(color.green, 90) : na, title="Background")
```

### Labels and Text
```pinescript
label.new(bar_index, high, text="High", style=label.style_label_down, color=color.green, textcolor=color.white)
table.new(position.top_right, 2, 1, bgcolor=color.new(color.black, 90), border_color=color.white)
```

## Strategy Framework

### Strategy Declaration
```pinescript
//@version=5
strategy("My Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)
```

### Entry/Exit Orders
```pinescript
if buySignal
    strategy.entry("Long", strategy.long)

if sellSignal
    strategy.entry("Short", strategy.short)

strategy.exit("Exit Long", "Long", profit=100, loss=50)
```

### Risk Management
```pinescript
strategy.risk.max_drawdown(20, strategy.risk.percent)
strategy.risk.max_intraday_drawdown(10, strategy.risk.percent)
strategy.risk.max_position_size(1000)
```

## Time Functions

### Bar Time
```pinescript
time("D")                    // Daily bars
time("W")                    // Weekly bars
time("M")                    // Monthly bars
timestamp(year, month, day)  // Specific date
```

### Time Conditions
```pinescript
inSession = time >= timestamp(2023, 1, 1, 9, 15) and time <= timestamp(2023, 1, 1, 15, 30)
isNewMonth = month != month[1]
isExpiryDay = dayofweek == dayofweek.thursday and day == 28 or day == 29 or day == 30 or day == 31
```

## Error Handling

### NaN Handling
```pinescript
safe_div = numerator / denominator or na
valid_value = value != na ? value : 0
```

### Boundary Checks
```pinescript
length := max(1, min(length, 100))  // Clamp between 1 and 100
```

## Performance Optimization

### Efficient Calculations
```pinescript
// Use built-in functions when possible
fast_sma = ta.sma(close, 14)  // Faster than manual calculation

// Avoid unnecessary calculations
calc_once = input.bool(true, "Calculate Once")
result := calc_once ? expensive_calculation() : result[1]
```

### Memory Management
```pinescript
// Limit array sizes
max_size = 100
array.push(my_array, new_value)
if array.size(my_array) > max_size
    array.shift(my_array)
```

## Debugging Techniques

### Print Statements
```pinescript
plotchar(true, char=tostring(close), location=location.top)
label.new(bar_index, high, tostring(my_value))
```

### Conditional Debugging
```pinescript
debug = input.bool(false, "Debug Mode")
if debug
    plot(my_variable, color=color.red, title="Debug")
```

## Best Practices

### Code Organization
- Use meaningful variable names
- Add comments for complex logic
- Group related inputs together
- Use consistent indentation

### Performance
- Minimize calculations in real-time
- Use appropriate data types
- Avoid unnecessary plot calls
- Cache expensive computations

### Maintainability
- Version control your scripts
- Document input parameters
- Test on multiple timeframes
- Validate edge cases

### Security
- Don't hardcode sensitive information
- Validate user inputs
- Use secure API endpoints
- Follow platform guidelines
