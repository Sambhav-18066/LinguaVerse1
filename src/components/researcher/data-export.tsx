import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function DataExport() {
    const { toast } = useToast();

    const handleExport = (dataType: string) => {
        toast({
            title: `Exporting ${dataType}...`,
            description: "This is a placeholder. In a real application, a CSV file would be generated and downloaded.",
        });
        // Mock download
        console.log(`Exporting ${dataType} data...`);
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download conversation logs and assessment scores as CSV files for analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => handleExport('Conversation Logs')}>
          <Download className="mr-2 h-4 w-4" />
          Export Conversation Logs
        </Button>
        <Button onClick={() => handleExport('Assessment Scores')}>
          <Download className="mr-2 h-4 w-4" />
          Export Assessment Scores
        </Button>
      </CardContent>
    </Card>
  );
}
