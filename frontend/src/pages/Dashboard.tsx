import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your StockVision overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs financial-gain">+8.2% this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winning Strategies</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15.8%</div>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Your latest stock analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { symbol: "AAPL", prediction: "Buy", confidence: 85, change: "+2.3%" },
                { symbol: "TSLA", prediction: "Hold", confidence: 72, change: "-0.8%" },
                { symbol: "MSFT", prediction: "Buy", confidence: 91, change: "+1.7%" },
                { symbol: "GOOGL", prediction: "Sell", confidence: 68, change: "-1.2%" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-semibold">{item.symbol}</div>
                    <Badge 
                      variant={item.prediction === "Buy" ? "default" : 
                               item.prediction === "Sell" ? "destructive" : "secondary"}
                    >
                      {item.prediction}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      item.change.startsWith('+') ? 'financial-gain' : 'financial-loss'
                    }`}>
                      {item.change}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.confidence}% confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Top Performing Strategies</CardTitle>
            <CardDescription>Your most successful backtesting results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Momentum Strategy", return: "+24.5%", sharpe: "1.8", trades: 45 },
                { name: "Mean Reversion", return: "+18.2%", sharpe: "1.5", trades: 32 },
                { name: "Breakout Strategy", return: "+15.7%", sharpe: "1.3", trades: 28 },
                { name: "RSI Divergence", return: "+12.1%", sharpe: "1.1", trades: 21 },
              ].map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-semibold">{strategy.name}</div>
                    <div className="text-sm text-muted-foreground">{strategy.trades} trades</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium financial-gain">{strategy.return}</div>
                    <div className="text-xs text-muted-foreground">Sharpe: {strategy.sharpe}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;