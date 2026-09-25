import { describe, expect, it } from "vitest";
import { buildTemplateDraft, DEFAULT_AVOID, DEFAULT_TONE } from "./brief-template";

const zune = {
  company: "Zune",
  valueProp: "Zune is an AI product studio that designs, builds, and hands over high-performance websites. Clients own the code.",
  icps: [
    { title: "Founder / CEO of Early-Stage SaaS", description: "Leads a 10–50 person SaaS company. Frustrated by scope creep." },
    { title: "Product Director", description: "Owns product modernization at a mid-market company." },
    { title: "Marketing Leader", description: "Responsible for brand presence at a services firm." },
  ],
  targetIndustries: ["B2B", "SaaS", "AI"],
  targetRegions: ["Europe"],
  website: "https://zune.dev",
};

describe("buildTemplateDraft", () => {
  it("writes whatToTell in the starter-brief phrasing", () => {
    const draft = buildTemplateDraft(zune);
    expect(draft.brief.whatToTell).toContain("Zune is described by the company as zune is an AI product studio");
    expect(draft.brief.whatToTell).toContain("The intended audience is professionals connected to B2B, SaaS, AI in Europe.");
    expect(draft.brief.whatToTell).toContain("keep every claim grounded in the confirmed company profile.");
  });

  it("uses the default DO / AVOID / tone lines with the company name filled in", () => {
    const draft = buildTemplateDraft(zune);
    expect(draft.brief.do[0]).toBe("Use only the confirmed information about Zune.");
    expect(draft.brief.avoid).toEqual(DEFAULT_AVOID);
    expect(draft.brief.tone).toBe(DEFAULT_TONE);
    expect(draft.brief.links).toEqual(["https://zune.dev"]);
  });

  it("builds three angles from the ICPs, each with a hook, direction and example", () => {
    const draft = buildTemplateDraft(zune);
    expect(draft.brief.angles).toHaveLength(3);
    expect(draft.brief.angles[0].angle).toBe("A practical introduction");
    expect(draft.brief.angles[1].angle).toContain("Product Director");
    for (const angle of draft.brief.angles) {
      expect(angle.hook.length).toBeGreaterThan(0);
      expect(angle.direction.length).toBeGreaterThan(0);
      expect(angle.example.length).toBeGreaterThan(0);
    }
  });

  it("names the campaign from the prompt when there is one", () => {
    expect(buildTemplateDraft(zune).name).toBe("Zune creator brief");
    const prompted = buildTemplateDraft({ ...zune, prompt: "I want to reach VP Sales in B2B SaaS in France." });
    expect(prompted.name).toBe("Zune — reach VP Sales in B2B SaaS in France");
    expect(prompted.description).toBe("Creators introduce Zune to reach VP Sales in B2B SaaS in France.");
    expect(prompted.brief.whatToTell).toContain("Campaign focus: I want to reach VP Sales");
  });

  it("still produces three angles for a brand with no ICPs or value prop", () => {
    const draft = buildTemplateDraft({ company: "Acme", valueProp: null, icps: [], targetIndustries: [], targetRegions: [] });
    expect(draft.brief.angles).toHaveLength(3);
    expect(draft.brief.targetGeos).toEqual(["Europe"]);
    expect(draft.brief.whatToTell).toContain("has not written its value proposition yet");
  });
});
