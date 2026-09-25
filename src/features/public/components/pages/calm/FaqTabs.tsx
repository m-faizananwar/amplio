"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionList } from "./QuestionList";

type Group = { label: string; items: { q: string; a: string }[] };

export function FaqTabs({ brands, creators }: { brands: Group; creators: Group }) {
  return (
    <Tabs defaultValue="brands" className="gap-8">
      <TabsList>
        <TabsTrigger value="brands">{brands.label}</TabsTrigger>
        <TabsTrigger value="creators">{creators.label}</TabsTrigger>
      </TabsList>
      <TabsContent value="brands" className="max-w-3xl"><QuestionList items={brands.items} /></TabsContent>
      <TabsContent value="creators" className="max-w-3xl"><QuestionList items={creators.items} /></TabsContent>
    </Tabs>
  );
}
