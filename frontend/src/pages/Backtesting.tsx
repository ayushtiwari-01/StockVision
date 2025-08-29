import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Play, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock backtesting data
const mockPerformanceData = [
  { date: "2024-01-01", portfolio: 10000, benchmark: 10000 },
  { date: "2024-01-15", portfolio: 10250, benchmark: 10120 },
  { date: "2024-02-01", portfolio: 10580, benchmark: 10180 },
  { date: "2024-02-15", portfolio: 10420, benchmark: 10340 },
  { date: "2024-03-01", portfolio: 10890, benchmark: 10450 },
  { date: "2024-03-15", portfolio: 11200, benchmark: 10590 },
  { date: "2024-04-01", portfolio: 11450, benchmark: 10720 },
];

const Backtesting = () => {
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const strategies = [
    "Momentum Strategy",
    "Mean Reversion",
    "Breakout Strategy",
    "RSI Divergence",
    "Moving Average Crossover",
  ];

  const stocks = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA", "META"];

  const handleRunBacktest = async () => {
    if (!selectedStrategy || !selectedStock) {
      toast({
        title: "Missing Information",
        description: "Please select both a strategy and a stock symbol",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    
    // Simulate backtesting process
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Backtest Complete",
        description: `Successfully backtested ${selectedStrategy} on ${selectedStock}`,
      });
    }, 3000);
  };

  // Mock metrics
  const metrics = {
    cagr: 14.5,
    sharpeRatio: 1.67,
    maxDrawdown: -8.2,
    totalReturn: 14.5,
    volatility: 18.3,
    winRate: 68.5,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Strategy Backtesting</h1>
        <p className="text-muted-foreground">Test trading strategies against historical data</p>
      </div>

      {/* Configuration */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Backtest Configuration</CardTitle>
          <CardDescription>Select a trading strategy and stock to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Trading Strategy</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Stock Symbol</label>
              <Select value={selectedStock} onValueChange={setSelectedStock}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stock" />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((stock) => (
                    <SelectItem key={stock} value={stock}>
                      {stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleRunBacktest}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>Running...</>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Backtest
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div className="text-sm font-medium">CAGR</div>
            </div>
            <div className="text-2xl font-bold financial-gain">
              {metrics.cagr > 0 ? '+' : ''}{metrics.cagr}%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">Sharpe Ratio</div>
            </div>
            <div className="text-2xl font-bold">{metrics.sharpeRatio}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-danger" />
              <div className="text-sm font-medium">Max Drawdown</div>
            </div>
            <div className="text-2xl font-bold financial-loss">{metrics.maxDrawdown}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-success" />
              <div className="text-sm font-medium">Total Return</div>
            </div>
            <div className="text-2xl font-bold financial-gain">+{metrics.totalReturn}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-1">Volatility</div>
            <div className="text-2xl font-bold">{metrics.volatility}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-1">Win Rate</div>
            <div className="text-2xl font-bold financial-gain">{metrics.winRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Strategy performance vs market benchmark over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any, name) => [`$${value.toLocaleString()}`, name === 'portfolio' ? 'Strategy Portfolio' : 'Market Benchmark']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  name="Strategy Portfolio"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Market Benchmark"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Details */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Strategy Analysis</CardTitle>
          <CardDescription>Detailed breakdown of the backtesting strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Trading Rules</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-8 h-6 p-0 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3" />
                  </Badge>
                  <span>Buy when predicted price &gt; actual price</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="w-8 h-6 p-0 flex items-center justify-center">
                    <TrendingDown className="w-3 h-3" />
                  </Badge>
                  <span>Sell when predicted price &lt; actual price</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-8 h-6 p-0 flex items-center justify-center text-xs">
                    H
                  </Badge>
                  <span>Hold when confidence &lt; 70%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Performance Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Trades:</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span>Winning Trades:</span>
                  <span className="font-medium financial-gain">32 (68.1%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Trade:</span>
                  <span className="font-medium">+2.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Trade:</span>
                  <span className="font-medium financial-gain">+12.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Trade:</span>
                  <span className="font-medium financial-loss">-5.2%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Backtesting;