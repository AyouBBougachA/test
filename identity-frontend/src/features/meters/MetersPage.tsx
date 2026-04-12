import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Activity, Search, Loader2, Thermometer, Gauge, Clock } from 'lucide-react';
import { equipmentApi } from '@/api/equipmentApi';
import { Meter } from '@/types';
import { Button } from '@/components/ui';
import MeterReadingModal from './MeterReadingModal';

export default function MetersPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);

  const fetchMeters = async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.getMeters();
      setMeters(data);
    } catch (err) {
      console.error('Failed to fetch meters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleUpdateClick = (meter: Meter) => {
    setSelectedMeter(meter);
    setIsUpdateModalOpen(true);
  };

  const filteredMeters = meters.filter(meter => 
    meter.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meter.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Meter Readings</h2>
          <p className="text-muted-foreground">Monitor and record equipment usage metrics.</p>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          One meter per equipment • Adjustments only
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/60 shadow-sm">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <input 
          type="text" 
          placeholder="Search meters or equipment..." 
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
        </div>
      ) : filteredMeters.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeters.map((meter) => (
            <Card key={meter.meterId} className="bg-card hover:shadow-md transition-all border-border/60 overflow-hidden group">
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {meter.unit === '°C' ? <Thermometer className="w-4 h-4 text-primary" /> : <Gauge className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="text-xs font-bold px-2 py-1 bg-background rounded-full border border-border shadow-sm uppercase tracking-wider">
                    {meter.meterType || 'ODOMETER'}
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{meter.name || meter.equipmentName || 'Equipment Meter'}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  {meter.equipmentName || 'Unassigned'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Current Reading</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-foreground">{meter.value ?? meter.lastValue ?? 0}</span>
                      <span className="text-sm font-bold text-muted-foreground">{meter.unit}</span>
                    </div>
                  </div>
                  {meter.lastReadingAt && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> Last Update
                      </p>
                      <p className="text-xs font-medium mt-0.5">
                        {new Date(meter.lastReadingAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {meter.thresholds && meter.thresholds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Thresholds</p>
                    {meter.thresholds.map((value, index) => (
                      <span key={`${meter.meterId}-${index}`} className="text-[10px] font-bold px-2 py-1 bg-muted/40 rounded-full">
                        {value} {meter.unit}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs h-9">View History</Button>
                  <Button className="flex-1 text-xs h-9" onClick={() => handleUpdateClick(meter)}>Adjust</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Gauge className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold">No meters found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              No meters match your search criteria or none have been registered yet.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>Clear Search</Button>
          </CardContent>
        </Card>
      )}
    </div>

    {selectedMeter && (
      <MeterReadingModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedMeter(null);
        }} 
        onSuccess={fetchMeters} 
        meter={selectedMeter}
      />
    )}
  </>
);
}
