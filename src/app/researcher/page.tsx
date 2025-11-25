import { AiConfigForm } from "@/components/researcher/ai-config-form";
import { DataExport } from "@/components/researcher/data-export";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Download } from "lucide-react";

export default function ResearcherPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Researcher Panel</h1>
        <p className="text-muted-foreground">Configure AI behavior and export study data.</p>
      </div>
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="config"><FlaskConical className="mr-2 h-4 w-4" />AI Configuration</TabsTrigger>
          <TabsTrigger value="export"><Download className="mr-2 h-4 w-4" />Data Export</TabsTrigger>
        </TabsList>
        <TabsContent value="config" className="mt-6">
          <AiConfigForm />
        </TabsContent>
        <TabsContent value="export" className="mt-6">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
