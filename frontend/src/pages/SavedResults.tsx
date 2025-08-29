import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Eye, Download, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedResult {
  id: string;
  type: "prediction" | "backtest";
  symbol: string;
  name: string;
  date: string;
  performance?: string;
  confidence?: number;
  strategy?: string;
}

const mockResults: SavedResult[] = [
  {
    id: "1",
    type: "prediction",
    symbol: "AAPL",
    name: "AAPL Price Prediction",
    date: "2024-01-15",
    confidence: 85,
  },
  {
    id: "2",
    type: "backtest",
    symbol: "TSLA",
    name: "Momentum Strategy on TSLA",
    date: "2024-01-14",
    performance: "+18.5%",
    strategy: "Momentum Strategy",
  },
  {
    id: "3",
    type: "prediction",
    symbol: "MSFT",
    name: "MSFT Weekly Forecast",
    date: "2024-01-13",
    confidence: 78,
  },
  {
    id: "4",
    type: "backtest",
    symbol: "GOOGL",
    name: "Mean Reversion Analysis",
    date: "2024-01-12",
    performance: "+12.3%",
    strategy: "Mean Reversion",
  },
  {
    id: "5",
    type: "prediction",
    symbol: "AMZN",
    name: "AMZN Long-term Prediction",
    date: "2024-01-11",
    confidence: 92,
  },
  {
    id: "6",
    type: "backtest",
    symbol: "NVDA",
    name: "Breakout Strategy Test",
    date: "2024-01-10",
    performance: "+24.7%",
    strategy: "Breakout Strategy",
  },
];

const SavedResults = () => {
  const [results, setResults] = useState<SavedResult[]>(mockResults);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "prediction" | "backtest">("all");
  const { toast } = useToast();

  const filteredResults = results.filter((result) => {
    const matchesSearch = result.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || result.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    setResults(results.filter(result => result.id !== id));
    toast({
      title: "Result Deleted",
      description: "The saved result has been removed successfully",
    });
  };

  const handleView = (result: SavedResult) => {
    toast({
      title: "Opening Result",
      description: `Loading ${result.name}...`,
    });
    // In a real app, this would navigate to the detailed view
  };

  const handleDownload = (result: SavedResult) => {
    toast({
      title: "Downloading",
      description: `Preparing download for ${result.name}...`,
    });
    // In a real app, this would trigger a file download
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Saved Results</h1>
        <p className="text-muted-foreground">Manage your saved predictions and backtest results</p>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="prediction">Predictions Only</SelectItem>
                  <SelectItem value="backtest">Backtests Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResults.length} of {results.length} results
        </p>
        {filteredResults.length > 0 && (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        )}
      </div>

      {/* Results Grid */}
      {filteredResults.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "You haven't saved any results yet"}
              </p>
              {!searchQuery && filterType === "all" && (
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => window.location.href = '/predictions'}>
                    Create Prediction
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/backtesting'}>
                    Run Backtest
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((result) => (
            <Card key={result.id} className="shadow-card hover:shadow-hover transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge 
                    variant={result.type === "prediction" ? "default" : "secondary"}
                    className="mb-2"
                  >
                    {result.type === "prediction" ? "Prediction" : "Backtest"}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleView(result)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(result)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => handleDelete(result.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{result.name}</CardTitle>
                <CardDescription>
                  {result.symbol} • {new Date(result.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.type === "prediction" && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className="font-semibold">{result.confidence}%</span>
                    </div>
                  )}
                  {result.type === "backtest" && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Strategy:</span>
                        <span className="font-semibold text-sm">{result.strategy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Performance:</span>
                        <span className={`font-semibold ${
                          result.performance?.startsWith('+') ? 'financial-gain' : 'financial-loss'
                        }`}>
                          {result.performance}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleView(result)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedResults;