export type CandidateStatus = "processing" | "review" | "shortlisted" | "error";
export type Candidate = {
  id: string;
  name: string;
  email: string;
  location: string;
  title: string;
  resumeName: string;
  resumeText: string;
  note: string;
  roleId: string;
  status: CandidateStatus;
  stage: number;
  source: string;
};
export type Role = {
  id: string;
  title: string;
  team: string;
  location: string;
  requirements: string[];
};
export const roles: Role[] = [
  {
    id: "ai",
    title: "Founding AI Engineer",
    team: "Early-stage AI team",
    location: "London · Hybrid",
    requirements: ["Python", "LLMs", "RAG", "APIs"],
  },
  {
    id: "fullstack",
    title: "Full-stack Engineer",
    team: "Product engineering team",
    location: "Remote · UK",
    requirements: ["React", "TypeScript", "Postgres", "APIs"],
  },
  {
    id: "ml",
    title: "ML Platform Engineer",
    team: "Applied ML team",
    location: "London · Hybrid",
    requirements: ["Python", "PyTorch", "Docker", "AWS"],
  },
];
export const samples = [
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya.chen@example.com",
    location: "London, UK",
    title: "AI Engineer",
    roleId: "ai",
    resumeName: "maya-chen-resume.pdf",
    resumeText:
      "AI Engineer with 5 years of software experience. Built Python services and production LLMs applications. Designed a RAG pipeline with retrieval evaluations. Shipped REST APIs with product teams. Also works with TypeScript and Docker.",
    note: "Looking for a small team building useful AI products. Available in four weeks.",
  },
  {
    id: "jordan",
    name: "Jordan Ellis",
    email: "jordan.ellis@example.com",
    location: "Manchester, UK",
    title: "Full-stack Engineer",
    roleId: "fullstack",
    resumeName: "jordan-ellis-resume.pdf",
    resumeText:
      "Full-stack Engineer with 4 years of experience. Built React interfaces with TypeScript. Designed Postgres schemas and REST APIs for a B2B product. Works closely with design and customers.",
    note: "Interested in product ownership and a remote-first team.",
  },
  {
    id: "sam",
    name: "Sam Rivera",
    email: "sam.rivera@example.com",
    location: "Bristol, UK",
    title: "ML Engineer",
    roleId: "ml",
    resumeName: "sam-rivera-resume.pdf",
    resumeText:
      "ML Engineer building Python training pipelines with PyTorch. Packages inference services using Docker and deploys on AWS. Interested in reliable machine learning infrastructure.",
    note: "Open to ML infrastructure opportunities.",
  },
];
export const seedCandidates = (): Candidate[] => [
  {
    ...samples[0],
    id: "DH-1001",
    status: "review",
    stage: 4,
    source: "Talent form",
  },
  {
    ...samples[1],
    id: "DH-1002",
    status: "shortlisted",
    stage: 4,
    source: "Talent form",
  },
  {
    ...samples[2],
    id: "DH-1003",
    status: "review",
    stage: 4,
    source: "Talent form",
  },
  {
    id: "DH-1004",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    location: "Leeds, UK",
    title: "Software Engineer",
    roleId: "ai",
    resumeName: "alex-morgan-resume.pdf",
    resumeText:
      "Software Engineer building Python APIs. Interested in transitioning into applied AI. No details of retrieval or model deployment supplied.",
    note: "Keen to learn more about the role.",
    status: "review",
    stage: 4,
    source: "Talent form",
  },
];
export function matchRole(text: string, role: Role) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const evidence = role.requirements.map((skill) => {
    const expression = new RegExp(`\\b${skill}\\b`, "i");
    const sentence = sentences.find((line) => expression.test(line)) || "";
    return { skill, sentence, found: Boolean(sentence) };
  });
  return {
    role,
    evidence,
    covered: evidence.filter((item) => item.found).length,
    total: role.requirements.length,
  };
}
export function matchesFor(candidate: Candidate) {
  return roles
    .map((role) => matchRole(candidate.resumeText, role))
    .sort(
      (a, b) =>
        b.covered - a.covered ||
        Number(b.role.id === candidate.roleId) -
          Number(a.role.id === candidate.roleId),
    );
}
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
export function validateSubmission(input: {
  name: string;
  email: string;
  location: string;
  resumeText: string;
  consent: boolean;
}) {
  if (input.name.trim().length < 2 || input.name.length > 100)
    return "Enter a name between 2 and 100 characters.";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) ||
    input.email.length > 254
  )
    return "Enter a valid email address.";
  if (!input.location.trim() || input.location.length > 100)
    return "Enter a location, up to 100 characters.";
  if (!input.resumeText.trim())
    return "Choose a sample résumé before submitting.";
  if (!input.consent)
    return "Confirm that you are using fictional information for this demo.";
  return "";
}
export function advanceCandidate(
  candidate: Candidate,
  fail: boolean,
): Candidate {
  if (candidate.status !== "processing") return candidate;
  if (fail && candidate.stage === 2) return { ...candidate, status: "error" };
  const stage = Math.min(4, candidate.stage + 1);
  return { ...candidate, stage, status: stage === 4 ? "review" : "processing" };
}
export function createCandidate(
  input: Omit<Candidate, "id" | "stage" | "status" | "source">,
  existing: Candidate[],
): { candidate: Candidate; duplicate: boolean } {
  const found = existing.find(
    (candidate) =>
      normalizeEmail(candidate.email) === normalizeEmail(input.email),
  );
  if (found) return { candidate: found, duplicate: true };
  const nextId =
    Math.max(
      1000,
      ...existing.map(
        (candidate) => Number(candidate.id.split("-")[1]) || 1000,
      ),
    ) + 1;
  return {
    candidate: {
      ...input,
      name: input.name.trim(),
      email: normalizeEmail(input.email),
      location: input.location.trim(),
      id: `DH-${nextId}`,
      stage: 0,
      status: "processing",
      source: "Talent form",
    },
    duplicate: false,
  };
}
