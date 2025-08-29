import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, TrendingDown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PredictionData {
  date: string;
  predicted_return: number;
  signal: string;
  confidence: number;
}

interface PredictionResponse {
  ticker: string;
  current_price: number;
  predictions: PredictionData[];
  total_return: number;
  confidence: number;
  history: { date: string; close: number }[];
  success: boolean;
  message: string;
}

const SIGNAL_BADGE_VARIANTS: Record<string, { variant: string; icon?: JSX.Element }> = {
  Buy: { variant: "default", icon: <TrendingUp className="w-3 h-3" /> },
  Sell: { variant: "destructive", icon: <TrendingDown className="w-3 h-3" /> },
  Hold: { variant: "secondary" },
};

const Predictions = () => {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState("AAPL");
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [historicalPeriod, setHistoricalPeriod] = useState("1y");
  const [forecastDays, setForecastDays] = useState(5);
  const [difficulty, setDifficulty] = useState("basic");
  const [history, setHistory] = useState<{ date: string; close: number }[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePredict = async () => {
    if (!ticker.trim()) {
      toast({
        title: "Please enter a stock ticker",
        description: "Enter a valid stock symbol like AAPL, TSLA, or MSFT",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          period: historicalPeriod,
          forecast_days: forecastDays,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: PredictionResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Prediction failed");
      }

      setCurrentStock(ticker.toUpperCase());
      setPredictionData(result.predictions || []);
      setHistory(result.history || []);
      setModelInfo({
        current_price: result.current_price,
        total_return: result.total_return,
        confidence: result.confidence,
        model_type: "ML Model",
      });

      toast({
        title: "Prediction Complete",
        description: `Generated ${forecastDays}-day predictions for ${ticker.toUpperCase()} - Expected return: ${(result.total_return || 0).toFixed(2)}%`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast({
        title: "Prediction Failed",
        description: message,
        variant: "destructive",
      });
      setPredictionData([]);
      setModelInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save predictions",
        variant: "destructive",
      });
      return;
    }

    if (!predictionData.length) {
      toast({
        title: "No Data to Save",
        description: "Please generate a prediction first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/save-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          result_type: "prediction",
          ticker: currentStock,
          data: {
            predictions: predictionData,
            model_info: modelInfo,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Prediction saved to your account!" });
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast({ title: "Save Failed", description: "Could not save prediction", variant: "destructive" });
    }
  };

  const chartData = useMemo(() => {
    if (!modelInfo) return [];

    const hist = (history || []).map((h) => ({
      date: h.date,
      actual: h.close,
    }));

    const preds = (predictionData || []).map((item, index) => {
      const currentPrice = modelInfo.current_price || 0;
      const cumulativeReturn = predictionData
        .slice(0, index + 1)
        .reduce((acc, curr) => acc * (1 + (curr.predicted_return || 0)), 1);
      const predictedPrice = currentPrice * cumulativeReturn;
      return {
        date: item.date || new Date().toISOString().split("T")[0],
        predicted: predictedPrice,
        signal: item.signal || "Hold",
        confidence: typeof item.confidence === "number" ? item.confidence * 100 : null,
      };
    });

    return [...hist, ...preds];
  }, [history, predictionData, modelInfo]);

  const tableData = (predictionData || []).slice(0, Math.min(10, forecastDays)).map((item, index) => {
    const currentPrice = modelInfo?.current_price || 0;
    const cumulativeReturn = predictionData
      .slice(0, index + 1)
      .reduce((acc, curr) => acc * (1 + (curr.predicted_return || 0)), 1);
    const predictedPrice = currentPrice * cumulativeReturn;
    return {
      date: item.date,
      predicted: predictedPrice,
      signal: item.signal,
      confidence: typeof item.confidence === "number" ? item.confidence * 100 : null,
    };
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Stock Predictions</h1>
        <p className="text-muted-foreground">AI-powered stock price forecasting</p>
      </div>

      {/* Enhanced Search Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Analyze Stock</CardTitle>
          <CardDescription>Configure your stock prediction parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                className="flex-1"
                placeholder="Enter stock ticker (e.g., AAPL, TSLA, MSFT)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handlePredict()}
              />
              <Button onClick={handlePredict} disabled={isLoading} className="min-w-[120px]">
                {isLoading ? "Analyzing..." : <><Search className="w-4 h-4 mr-2" />Predict</>}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="historical-period">Historical Data Period</Label>
                <Select value={historicalPeriod} onValueChange={setHistoricalPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3mo">3 Months (Fast)</SelectItem>
                    <SelectItem value="6mo">6 Months</SelectItem>
                    <SelectItem value="1y">1 Year (Default)</SelectItem>
                    <SelectItem value="2y">2 Years</SelectItem>
                    <SelectItem value="5y">5 Years (Comprehensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecast-days">Forecast Period</Label>
                <Select value={forecastDays.toString()} onValueChange={(value) => setForecastDays(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Days to predict" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="5">5 Days (Default)</SelectItem>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="14">2 Weeks</SelectItem>
                    <SelectItem value="30">1 Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-complexity">Model Complexity</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (Fast)</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced (Slow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Info Section */}
      {modelInfo && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Prediction Summary</CardTitle>
            <CardDescription>Analysis based on {historicalPeriod} of historical data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">${modelInfo.current_price?.toFixed(2) || "0"}</div>
                <div className="text-sm text-muted-foreground">Current Price</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${modelInfo.total_return >= 0 ? "text-success" : "text-danger"}`}>
                  {modelInfo.total_return >= 0 ? "+" : ""}{modelInfo.total_return?.toFixed(2) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Expected Return ({forecastDays} days)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-info">{((modelInfo.confidence || 0) * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Overall Confidence</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{predictionData.length}</div>
                <div className="text-sm text-muted-foreground">Forecast Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Section - FIXED Layout */}
      {chartData.length > 0 ? (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {currentStock} - AI Price Predictions
                </CardTitle>
                <CardDescription>
                  Real-time predictions from your ML model
                </CardDescription>
              </div>
              <Button onClick={handleSavePrediction} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <YAxis domain={["dataMin - 5", "dataMax + 5"]} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    formatter={(value: any, name) => [typeof value === "number" ? `$${value.toFixed(2)}` : "N/A", name]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#9ca3af" strokeWidth={2} name="Historical Price" dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} name="Predicted Price" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground mb-4">Enter a stock ticker symbol above and click "Predict" to generate AI-powered forecasts</p>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {tableData.length > 0 && (
        <Card className="shadow-card overflow-x-auto">
          <CardHeader>
            <CardTitle>Prediction Details</CardTitle>
            <CardDescription>Detailed breakdown of predictions and trading signals</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Predicted Price</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, index) => {
                  const badge = SIGNAL_BADGE_VARIANTS[row.signal || "Hold"];
                  return (
                    <TableRow key={index}>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>{row.predicted ? `$${row.predicted.toFixed(2)}` : "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className="flex items-center gap-1 w-fit">
                          {badge.icon} {row.signal || "Hold"}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.confidence !== null ? `${row.confidence.toFixed(1)}%` : "--"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Predictions;
