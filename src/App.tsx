import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Inbox,
  Layers3,
  LayoutDashboard,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  advanceCandidate,
  createCandidate,
  matchesFor,
  matchRole,
  roles,
  samples,
  seedCandidates,
  validateSubmission,
} from "./domain";
import type { Candidate } from "./domain";

type View = "workspace" | "talent" | "compare" | "architecture";
const stages = [
  "Submission received",
  "Résumé stored",
  "Profile extracted",
  "Roles compared",
  "Ready for human review",
];
const statusLabels = {
  processing: "Processing",
  review: "Needs review",
  shortlisted: "Shortlisted",
  error: "Processing paused",
};
const initials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
function Tag({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`tag ${tone}`}>{children}</span>;
}

export default function App() {
  const initialView = (): View => {
    const route = window.location.hash.replace("#/", "");
    return ["talent", "compare", "architecture"].includes(route)
      ? (route as View)
      : "workspace";
  };
  const [view, setView] = useState<View>(initialView);
  const [candidates, setCandidates] = useState(seedCandidates);
  const [selectedId, setSelectedId] = useState("DH-1001");
  const [filter, setFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [inspectorTab, setInspectorTab] = useState("match");
  const [matchId, setMatchId] = useState("");
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState("");
  const [failProcessing, setFailProcessing] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeNode, setActiveNode] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    roleId: "ai",
    note: "",
  });
  const [sampleId, setSampleId] = useState("");
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const selected =
    candidates.find((candidate) => candidate.id === selectedId) ||
    candidates[0];
  const submitted = candidates.find(
    (candidate) => candidate.id === submittedId,
  );
  const match = selected
    ? matchId
      ? matchRole(
          selected.resumeText,
          roles.find((role) => role.id === matchId) || roles[0],
        )
      : matchesFor(selected)[0]
    : null;
  const processing = candidates.filter(
    (candidate) => candidate.status === "processing",
  ).length;
  const filtered = candidates.filter(
    (candidate) =>
      (filter === "all" || candidate.status === filter) &&
      (roleFilter === "all" || candidate.roleId === roleFilter) &&
      `${candidate.name} ${candidate.title} ${candidate.email} ${candidate.resumeText}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (!processing) return;
    const timer = window.setInterval(
      () =>
        setCandidates((current) =>
          current.map((candidate) =>
            advanceCandidate(candidate, failProcessing),
          ),
        ),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [processing, failProcessing]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (resetOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [resetOpen]);
  useEffect(() => {
    const navigate = () => setView(initialView());
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  function navigate(next: View) {
    setView(next);
    const path = next === "workspace" ? "#/" : `#/${next}`;
    if (window.location.hash !== path) window.history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function select(candidate: Candidate) {
    setSelectedId(candidate.id);
    setMatchId("");
    setInspectorTab("match");
    setDraft("");
  }
  function useSample(id: string) {
    const sample = samples.find((item) => item.id === id)!;
    setSampleId(id);
    setForm({
      name: sample.name,
      email: sample.email.replace("@", `+demo@`),
      location: sample.location,
      roleId: sample.roleId,
      note: sample.note,
    });
    setFormError("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const sample = samples.find((item) => item.id === sampleId);
    const error = validateSubmission({
      ...form,
      resumeText: sample?.resumeText || "",
      consent,
    });
    if (error) {
      setFormError(error);
      return;
    }
    const result = createCandidate(
      {
        ...form,
        title: sample!.title,
        resumeName: sample!.resumeName,
        resumeText: sample!.resumeText,
      },
      candidates,
    );
    if (!result.duplicate)
      setCandidates((current) => [...current, result.candidate]);
    setSubmittedId(result.candidate.id);
    setDuplicate(result.duplicate);
    select(result.candidate);
    setFormError("");
  }
  function reset() {
    setCandidates(seedCandidates());
    setSelectedId("DH-1001");
    setSearch("");
    setFilter("all");
    setRoleFilter("all");
    setSubmittedId("");
    setSampleId("");
    setForm({ name: "", email: "", location: "", roleId: "ai", note: "" });
    setConsent(false);
    setFormError("");
    setFailProcessing(false);
    setMatchId("");
    setDraft("");
    setInspectorTab("match");
    setResetOpen(false);
    navigate("workspace");
    setToast("Demo reset. You’re ready for the next walkthrough.");
  }
  function reviewSubmitted() {
    if (submitted) select(submitted);
    setFilter("all");
    setRoleFilter("all");
    setSearch("");
    navigate("workspace");
  }
  function prepareDraft() {
    if (!selected || !match) return;
    const covered = match.evidence
      .filter((item) => item.found)
      .map((item) => item.skill);
    const missing = match.evidence
      .filter((item) => !item.found)
      .map((item) => item.skill);
    setDraft(
      `Hi ${selected.name.split(" ")[0]},\n\nThanks for sharing your profile with DenHire. ${covered.length ? `Your résumé mentions ${covered.join(", ")}, which overlap with our example ${match.role.title} brief.` : "We would like to understand more about your experience."}\n\n${missing.length ? `Could you tell us about any experience you have with ${missing.join(" and ")}?` : "What kind of team and technical challenges would you like to explore next?"}\n\nWould you be open to an introductory conversation?\n\nThe DenHire team`,
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => navigate("workspace")}
          aria-label="DenHire home"
        >
          denhire<span>ai</span>
          <span className="brand-dot" />
        </button>
        <div className="workspace-label">THE TALENT WORKSPACE</div>
        <nav aria-label="Demo navigation">
          <button
            className={view === "workspace" ? "active" : ""}
            onClick={() => navigate("workspace")}
          >
            <Inbox size={18} /> Talent inbox{" "}
            <span className="nav-count">{candidates.length}</span>
          </button>
          <button
            className={view === "talent" ? "active" : ""}
            onClick={() => navigate("talent")}
          >
            <Users size={18} /> Candidate experience{" "}
            <ArrowUpRight size={15} className="nav-end" />
          </button>
          <div className="nav-divider" />
          <span className="nav-caption">THE BIGGER PICTURE</span>
          <button
            className={view === "compare" ? "active" : ""}
            onClick={() => navigate("compare")}
          >
            <Layers3 size={18} /> Before & after
          </button>
          <button
            className={view === "architecture" ? "active" : ""}
            onClick={() => navigate("architecture")}
          >
            <GitBranch size={18} /> How it works
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="aaron-mark">
            <Sparkles size={20} />
          </div>
          <h3>
            AI-assisted.
            <br />
            Human-guided.
          </h3>
          <p>
            More context for the next
            <br />
            conversation.
          </p>
          <div className="sidebar-footer">
            <span className="avatar small">D</span>
            <div>
              DenHire workspace<small>Concept preview</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <strong>
              {
                {
                  workspace: "Talent inbox",
                  talent: "Candidate experience",
                  compare: "Before & after",
                  architecture: "How it works",
                }[view]
              }
            </strong>
          </div>
          <div className="header-actions">
            <span className="demo-label">
              <span /> Interactive demo
            </span>
            <button
              className="icon-button"
              title="Reset demo"
              aria-label="Reset demo"
              onClick={() => setResetOpen(true)}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>
        <main>
          {view === "workspace" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    FROM FIRST HELLO TO THE RIGHT CONVERSATION
                  </div>
                  <h1>Your next great connection.</h1>
                  <p>
                    Every introduction, in one place. Ready for a human touch.
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => navigate("talent")}
                >
                  <Plus size={17} /> Try a candidate submission
                </button>
              </div>
              <div className="journey-banner">
                <div className="journey-icon">
                  <GitBranch size={22} />
                </div>
                <div>
                  <strong>A better front door for talent.</strong>
                  <p>
                    Submit a profile. Follow its journey. See what a recruiter
                    receives.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => navigate("compare")}
                >
                  See what changes <ArrowRight size={17} />
                </button>
              </div>
              <div className="metrics">
                <div>
                  <span>Total candidates</span>
                  <strong>
                    {candidates.length.toString().padStart(2, "0")}
                  </strong>
                  <small>Structured, searchable profiles</small>
                </div>
                <div>
                  <span>Awaiting review</span>
                  <strong>
                    {candidates
                      .filter((c) => c.status === "review")
                      .length.toString()
                      .padStart(2, "0")}
                    <span className="metric-dot" />
                  </strong>
                  <small>The next conversations to consider</small>
                </div>
                <div>
                  <span>Shortlisted</span>
                  <strong>
                    {candidates
                      .filter((c) => c.status === "shortlisted")
                      .length.toString()
                      .padStart(2, "0")}
                  </strong>
                  <small>Selected by a recruiter</small>
                </div>
                <div>
                  <span>Open example roles</span>
                  <strong>03</strong>
                  <small>AI, product & platform engineering</small>
                </div>
              </div>
              <div className="workspace-grid">
                <section className="inbox-panel" aria-label="Candidate inbox">
                  <div className="section-heading">
                    <h2>
                      Talent inbox <span>{candidates.length}</span>
                    </h2>
                    <span className="muted small-text">
                      Fictional candidates
                    </span>
                  </div>
                  <div className="filter-tabs" aria-label="Candidate status">
                    {[
                      ["all", "All candidates"],
                      ["review", "Needs review"],
                      ["shortlisted", "Shortlisted"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        aria-pressed={filter === key}
                        className={filter === key ? "selected" : ""}
                        onClick={() => setFilter(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="filter-bar">
                    <label className="search">
                      <Search size={16} />
                      <input
                        aria-label="Search candidates"
                        placeholder="Search name or skill…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Filter by preferred role"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="all">All role interests</option>
                      {roles.map((role) => (
                        <option value={role.id} key={role.id}>
                          {role.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="list-head">
                    <span>CANDIDATE</span>
                    <span>STATUS</span>
                  </div>
                  <div className="candidate-list">
                    {filtered.map((candidate) => (
                      <button
                        key={candidate.id}
                        className={`candidate-row ${selectedId === candidate.id ? "selected" : ""}`}
                        aria-pressed={selectedId === candidate.id}
                        onClick={() => select(candidate)}
                      >
                        <span
                          className={`avatar tone-${candidate.id.slice(-1)}`}
                        >
                          {initials(candidate.name)}
                        </span>
                        <span className="candidate-info">
                          <strong>{candidate.name}</strong>
                          <span>{candidate.title}</span>
                          <small>{candidate.location}</small>
                        </span>
                        <span className="row-status">
                          <Tag tone={candidate.status}>
                            {statusLabels[candidate.status]}
                          </Tag>
                          <small>
                            {candidate.status === "processing"
                              ? stages[candidate.stage]
                              : candidate.id}
                          </small>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                    {!filtered.length && (
                      <div className="empty-state">
                        <Search size={25} />
                        <h3>No candidates match these filters</h3>
                        <p>Try a different name, skill, or role.</p>
                        <button
                          className="text-button"
                          onClick={() => {
                            setSearch("");
                            setFilter("all");
                            setRoleFilter("all");
                          }}
                        >
                          Clear filters <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="inbox-footer">
                    <ShieldCheck size={15} />
                    <span>
                      Recruiters decide. Suggested matches are starting points.
                    </span>
                  </div>
                </section>
                {selected && match && (
                  <section className="inspector" aria-label="Candidate details">
                    <div className="inspector-heading">
                      <span className="eyebrow">CANDIDATE PROFILE</span>
                      <span className="small-text muted">{selected.id}</span>
                    </div>
                    <div className="profile-heading">
                      <span className="avatar large">
                        {initials(selected.name)}
                      </span>
                      <div>
                        <h2>{selected.name}</h2>
                        <p>
                          {selected.title} · {selected.location}
                        </p>
                      </div>
                    </div>
                    <div className="profile-meta">
                      <Tag tone={selected.status}>
                        {statusLabels[selected.status]}
                      </Tag>
                      <span>
                        <CheckCheck size={14} /> Received via talent form
                      </span>
                    </div>
                    <div className="detail-tabs">
                      {[
                        ["match", "Role match"],
                        ["resume", "Résumé"],
                        ["activity", "Activity"],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setInspectorTab(key)}
                          aria-pressed={inspectorTab === key}
                          className={inspectorTab === key ? "selected" : ""}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {selected.status === "processing" ||
                    selected.status === "error" ? (
                      <div className="processing-panel">
                        <div
                          className={`processing-orb ${selected.status === "error" ? "paused" : ""}`}
                        >
                          <FileText size={26} />
                        </div>
                        <h3>
                          {selected.status === "error"
                            ? "Résumé processing paused"
                            : "Building the candidate profile"}
                        </h3>
                        <p>
                          {selected.status === "error"
                            ? "The submission is still here. Retry processing without asking the candidate to apply again."
                            : "The candidate has a receipt. Preparation continues in the background."}
                        </p>
                        <Progress candidate={selected} />
                        {selected.status === "error" && (
                          <button
                            className="button primary"
                            onClick={() => {
                              setFailProcessing(false);
                              setCandidates((current) =>
                                current.map((c) =>
                                  c.id === selected.id
                                    ? { ...c, status: "processing" }
                                    : c,
                                ),
                              );
                            }}
                          >
                            <RefreshCw size={16} /> Retry processing
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {inspectorTab === "match" && (
                          <div className="match-content">
                            <label className="field compact">
                              Compare with a role
                              <select
                                value={match.role.id}
                                onChange={(e) => {
                                  setMatchId(e.target.value);
                                  setDraft("");
                                }}
                              >
                                {roles.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.title}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="match-summary">
                              <span className="match-symbol">
                                <Sparkles size={21} />
                              </span>
                              <div>
                                <strong>
                                  {match.covered === match.total
                                    ? "Worth a conversation"
                                    : "A little more context needed"}
                                </strong>
                                <p>
                                  {match.covered} of {match.total} example
                                  skills mentioned
                                </p>
                              </div>
                            </div>
                            <div className="evidence-heading">
                              <h3>What the résumé tells us</h3>
                              <Tag>Demo rules</Tag>
                            </div>
                            <div className="evidence-list">
                              {match.evidence.map((item) => (
                                <details key={item.skill}>
                                  <summary>
                                    <span
                                      className={`evidence-icon ${item.found ? "found" : ""}`}
                                    >
                                      {item.found ? (
                                        <Check size={14} />
                                      ) : (
                                        <CircleHelp size={14} />
                                      )}
                                    </span>
                                    <strong>{item.skill}</strong>
                                    <span>
                                      {item.found
                                        ? "Mention found"
                                        : "Ask candidate"}
                                    </span>
                                    <ChevronRight size={14} />
                                  </summary>
                                  <p>
                                    {item.found
                                      ? `“${item.sentence}”`
                                      : `No ${item.skill} mention in this sample. This is missing evidence, not proof of missing ability.`}
                                  </p>
                                </details>
                              ))}
                            </div>
                            <p className="method-note">
                              Illustrative keyword matching, not an AI
                              assessment. Mentions do not verify experience or
                              job suitability.
                            </p>
                            <div className="aaron-panel">
                              <div>
                                <Sparkles size={16} />
                                <strong>Aaron’s next step</strong>
                                <Tag>Simulated</Tag>
                              </div>
                              <p>
                                Turn the profile and role context into a
                                personal first conversation.
                              </p>
                              <button
                                className="text-button"
                                onClick={prepareDraft}
                              >
                                {draft
                                  ? "Regenerate draft"
                                  : "Prepare a follow-up draft"}{" "}
                                <ArrowUpRight size={16} />
                              </button>
                              {draft && (
                                <div className="draft">
                                  <label className="field">
                                    Review & edit draft
                                    <textarea
                                      aria-label="Follow-up draft"
                                      value={draft}
                                      onChange={(e) => setDraft(e.target.value)}
                                      rows={10}
                                    />
                                  </label>
                                  <small>
                                    Template-generated from this profile. No
                                    message is sent.
                                  </small>
                                  <button
                                    className="text-button"
                                    onClick={() => {
                                      setDraft("");
                                      setToast(
                                        "Draft dismissed. No message was sent.",
                                      );
                                    }}
                                  >
                                    Dismiss draft <X size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              className={`button ${selected.status === "shortlisted" ? "secondary" : "primary"} full-width`}
                              onClick={() => {
                                setCandidates((current) =>
                                  current.map((c) =>
                                    c.id === selected.id
                                      ? {
                                          ...c,
                                          status:
                                            c.status === "shortlisted"
                                              ? "review"
                                              : "shortlisted",
                                        }
                                      : c,
                                  ),
                                );
                                setToast(
                                  selected.status === "shortlisted"
                                    ? "Moved back to review."
                                    : `${selected.name} added to your demo shortlist.`,
                                );
                              }}
                            >
                              {selected.status === "shortlisted" ? (
                                <>
                                  <ArrowLeft size={16} /> Return to review
                                </>
                              ) : (
                                <>
                                  <Check size={16} /> Add to shortlist
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {inspectorTab === "resume" && (
                          <div className="resume-content">
                            <div className="document-heading">
                              <FileText size={25} />
                              <div>
                                <strong>{selected.resumeName}</strong>
                                <small>
                                  Sample PDF · prewritten extracted text
                                </small>
                              </div>
                            </div>
                            <h3>Résumé excerpt</h3>
                            <p>{selected.resumeText}</p>
                            <h3>Candidate’s note</h3>
                            <p>{selected.note || "No note supplied."}</p>
                            <div className="contact-detail">
                              <Mail size={16} />
                              <span>{selected.email}</span>
                            </div>
                            <small className="muted">
                              All candidates are fictional. No real PDF is
                              uploaded or parsed.
                            </small>
                          </div>
                        )}
                        {inspectorTab === "activity" && (
                          <div className="activity-content">
                            <Progress candidate={selected} />
                            <div className="activity-note">
                              <ShieldCheck size={18} />
                              <p>
                                Submission and processing are separate. A
                                processing failure does not lose the candidate
                                record.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}
              </div>
            </>
          )}
          {view === "talent" && (
            <div className="talent-page">
              <button
                className="text-button back-button"
                onClick={() => navigate("workspace")}
              >
                <ArrowLeft size={16} /> Back to recruiter workspace
              </button>
              <div className="talent-layout">
                <section className="talent-story">
                  <div className="eyebrow">DENHIRE / TALENT</div>
                  <h1>
                    Your next chapter
                    <br />
                    starts <em>in the den.</em>
                  </h1>
                  <p>
                    Share your experience once.
                    <br />
                    Let’s find the right conversation.
                  </p>
                  <div className="talent-promises">
                    <div>
                      <span>01</span>
                      <div>
                        <strong>A proper introduction</strong>
                        <p>Your experience, interests, and résumé together.</p>
                      </div>
                    </div>
                    <div>
                      <span>02</span>
                      <div>
                        <strong>No email-app detours</strong>
                        <p>Receive confirmation right here, on the site.</p>
                      </div>
                    </div>
                    <div>
                      <span>03</span>
                      <div>
                        <strong>People, supported by context</strong>
                        <p>Our team reviews the possibilities with you.</p>
                      </div>
                    </div>
                  </div>
                  <div className="talent-wordmark">
                    denhire<span>ai</span>
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                  </div>
                  <small>Concept preview · fictional information only</small>
                </section>
                <section className="talent-form-panel">
                  {submitted ? (
                    <div className="success-panel">
                      <div className="success-mark">
                        <Check size={30} />
                      </div>
                      <Tag tone="review">
                        {duplicate
                          ? "Existing submission found"
                          : "Demo submission received"}
                      </Tag>
                      <h2>
                        {duplicate
                          ? "You’re already in the den."
                          : `You’re in, ${submitted.name.split(" ")[0]}.`}
                      </h2>
                      <p>
                        {duplicate
                          ? "We found the existing record for this email. No duplicate candidate was created."
                          : "Your profile is in the demo talent inbox. You can see exactly what happens next."}
                      </p>
                      <div className="receipt">
                        <span>SUBMISSION REFERENCE</span>
                        <strong>{submitted.id}</strong>
                        <small>{submitted.email}</small>
                      </div>
                      <Progress candidate={submitted} />
                      <button
                        className="button primary full-width"
                        onClick={reviewSubmitted}
                      >
                        See the recruiter’s view <ArrowRight size={17} />
                      </button>
                      <button
                        className="text-button"
                        onClick={() => {
                          setSubmittedId("");
                          setFormError("");
                        }}
                      >
                        Try another submission <ArrowRight size={15} />
                      </button>
                      <p className="method-note">
                        Saved in this demo session only. Nothing was sent to
                        DenHire.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="section-heading">
                        <div>
                          <div className="eyebrow">MAKE YOUR INTRODUCTION</div>
                          <h2>A little about you.</h2>
                        </div>
                        <Tag>Demo form</Tag>
                      </div>
                      <p className="form-intro">
                        Choose a fictional profile to try the whole journey.
                      </p>
                      <div className="sample-buttons">
                        {samples.map((sample) => (
                          <button
                            type="button"
                            key={sample.id}
                            className={sampleId === sample.id ? "chosen" : ""}
                            onClick={() => useSample(sample.id)}
                          >
                            <span className="avatar small">
                              {initials(sample.name)}
                            </span>
                            {sample.name.split(" ")[0]}
                            {sampleId === sample.id ? (
                              <Check size={14} />
                            ) : (
                              <Plus size={14} />
                            )}
                          </button>
                        ))}
                      </div>
                      <form onSubmit={submit} noValidate>
                        <div className="form-row">
                          <label className="field">
                            Full name
                            <input
                              required
                              maxLength={100}
                              value={form.name}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              placeholder="Your name"
                              autoComplete="off"
                            />
                          </label>
                          <label className="field">
                            Email address
                            <input
                              required
                              type="email"
                              maxLength={254}
                              value={form.email}
                              onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                              }
                              placeholder="you@example.com"
                              autoComplete="off"
                            />
                          </label>
                        </div>
                        <div className="form-row">
                          <label className="field">
                            Location
                            <input
                              required
                              maxLength={100}
                              value={form.location}
                              onChange={(e) =>
                                setForm({ ...form, location: e.target.value })
                              }
                              placeholder="City, country"
                            />
                          </label>
                          <label className="field">
                            What interests you?
                            <select
                              value={form.roleId}
                              onChange={(e) =>
                                setForm({ ...form, roleId: e.target.value })
                              }
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.title}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div
                          className={`resume-picker ${sampleId ? "has-file" : ""}`}
                        >
                          <FileText size={28} />
                          <div>
                            <strong>
                              {sampleId
                                ? samples.find((s) => s.id === sampleId)
                                    ?.resumeName
                                : "Your résumé goes here"}
                            </strong>
                            <p>
                              {sampleId
                                ? "Sample résumé attached · no upload required"
                                : "Choose Maya, Jordan, or Sam above to attach a sample."}
                            </p>
                          </div>
                          {sampleId && <Check size={20} />}
                        </div>
                        <label className="field">
                          What would you like to do next?{" "}
                          <span className="optional">Optional</span>
                          <textarea
                            rows={3}
                            maxLength={1500}
                            value={form.note}
                            onChange={(e) =>
                              setForm({ ...form, note: e.target.value })
                            }
                            placeholder="The work, team, or challenge you’re looking for…"
                          />
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                          />
                          <span>
                            I’m using fictional information to explore this
                            demo.
                          </span>
                        </label>
                        {formError && (
                          <div className="form-error" role="alert">
                            {formError}
                          </div>
                        )}
                        <button
                          className="button primary full-width"
                          type="submit"
                        >
                          Submit demo profile <ArrowRight size={17} />
                        </button>
                        <p className="form-footnote">
                          <ShieldCheck size={14} /> Session only. No real
                          uploads, emails, or AI calls.
                        </p>
                      </form>
                    </>
                  )}
                </section>
              </div>
            </div>
          )}
          {view === "compare" && (
            <Comparison onStart={() => navigate("talent")} />
          )}
          {view === "architecture" && (
            <Architecture
              active={activeNode}
              onSelect={setActiveNode}
              fail={failProcessing}
              onFail={setFailProcessing}
              onStart={() => navigate("talent")}
            />
          )}
        </main>
        <footer className="demo-footer">
          <span>
            <span className="status-dot" /> A working concept, with fictional
            data
          </span>
          <span>Session resets on refresh · Backend & AI simulated</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      <dialog
        ref={dialogRef}
        onCancel={() => setResetOpen(false)}
        onClose={() => setResetOpen(false)}
      >
        <h2>Reset this walkthrough?</h2>
        <p>
          This clears your demo submissions, shortlist changes, and drafts, then
          restores the four fictional profiles.
        </p>
        <div className="dialog-actions">
          <button
            className="button secondary"
            onClick={() => setResetOpen(false)}
          >
            Keep exploring
          </button>
          <button className="button primary" onClick={reset}>
            Reset demo
          </button>
        </div>
      </dialog>
    </div>
  );
}

function Progress({ candidate }: { candidate: Candidate }) {
  return (
    <ol className="progress-list" aria-label="Submission progress">
      {stages.map((stage, index) => (
        <li key={stage} className={index <= candidate.stage ? "done" : ""}>
          <span>
            {index <= candidate.stage ? <Check size={12} /> : index + 1}
          </span>
          <div>
            {stage}
            {index === candidate.stage && candidate.status === "processing" && (
              <small>Processing…</small>
            )}
            {index === candidate.stage && candidate.status === "error" && (
              <small>Paused · retry from the recruiter view</small>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Comparison({ onStart }: { onStart: () => void }) {
  const rows = [
    [
      "Candidate handoff",
      "Prepare an email, then send it in an email app.",
      "Submit on the site and receive a reference.",
    ],
    [
      "Confirmation",
      "The site cannot confirm the email was actually sent.",
      "The candidate sees that the submission was accepted.",
    ],
    [
      "Recruiter context",
      "Read a message and piece together the details.",
      "Open one record with résumé, interests, and notes.",
    ],
    [
      "Role discovery",
      "Compare experience with open roles manually.",
      "Start with evidence and gaps against a role brief.",
    ],
    [
      "Follow-up",
      "Write a new message from scratch.",
      "Review a contextual draft, then make it personal.",
    ],
    [
      "If processing fails",
      "An email-app handoff can leave the visitor stuck.",
      "Keep the submission and retry the background work.",
    ],
  ];
  return (
    <div className="explain-page">
      <div className="eyebrow">THE OPPORTUNITY</div>
      <h1>
        A conversation shouldn’t
        <br />
        get lost at “send.”
      </h1>
      <p className="lead">
        Keep DenHire’s personal approach. Give every introduction a more
        reliable beginning.
      </p>
      <div className="comparison">
        <div className="compare-heading">
          <span>THE EXPERIENCE</span>
          <div>
            <Mail size={21} />
            <h2>Today: email handoff</h2>
            <p>Prepare email → open email app → send</p>
          </div>
          <div>
            <CheckCheck size={21} />
            <h2>Proposed: connected intake</h2>
            <p>Submit → confirm → review → connect</p>
          </div>
        </div>
        {rows.map(([label, before, after]) => (
          <div className="compare-row" key={label}>
            <strong>{label}</strong>
            <p>{before}</p>
            <p>
              <Check size={15} />
              {after}
            </p>
          </div>
        ))}
      </div>
      <div className="observed-note">
        <CircleHelp size={19} />
        <p>
          <strong>A real friction point:</strong> James reported that the email
          handoff opened Chrome but never reached Gmail. The proposed intake
          removes that email-app dependency. This is a reported experience, not
          a claim that every visitor has the same problem.
        </p>
      </div>
      <div className="compare-bottom">
        <div>
          <h2>See the difference for yourself.</h2>
          <p>
            No estimated time savings or conversion claims. Just a workflow you
            can try.
          </p>
        </div>
        <button className="button primary" onClick={onStart}>
          Try the candidate journey <ArrowRight size={17} />
        </button>
      </div>
      <small className="muted">
        Based on the visible “Prepare email” flow at{" "}
        <a
          href="https://denhire.online/#contact"
          target="_blank"
          rel="noreferrer"
        >
          denhire.online
        </a>
        . Proposed capabilities are demonstrated with local simulation.
      </small>
    </div>
  );
}

function Architecture({
  active,
  onSelect,
  fail,
  onFail,
  onStart,
}: {
  active: number;
  onSelect: (index: number) => void;
  fail: boolean;
  onFail: (value: boolean) => void;
  onStart: () => void;
}) {
  const nodes = [
    {
      icon: Users,
      title: "A new front door",
      tech: "React + TypeScript · /talent",
      text: "The existing website stays in place. A dedicated candidate form captures a consistent introduction and résumé.",
      benefit:
        "Candidates stay on the site instead of being handed to an email application.",
    },
    {
      icon: ShieldCheck,
      title: "Accept the introduction",
      tech: "Netlify Function · submit-candidate",
      text: "The planned endpoint validates a submission and returns a receipt after storage is accepted. An idempotency key would prevent accidental double submissions.",
      benefit: "A clear confirmation, with a reference both sides can use.",
    },
    {
      icon: Database,
      title: "Keep the pieces together",
      tech: "Netlify Blobs + Postgres",
      text: "The résumé belongs in private blob storage; the candidate record and a résumé reference belong in Postgres. Production needs protected access and recovery if only one write succeeds.",
      benefit:
        "A structured, searchable talent pool rather than disconnected email threads.",
    },
    {
      icon: GitBranch,
      title: "Prepare the context",
      tech: "Background Function · TypeScript",
      text: "Extract résumé text, load job requirements, and compare the two asynchronously. Processing failures must be visible and retryable without losing the intake record.",
      benefit: "The candidate can move on while the profile is prepared.",
    },
    {
      icon: Sparkles,
      title: "Suggest, with evidence",
      tech: "Jev · typed decision model (proposed)",
      text: "Jev evaluates supplied context against typed questions: Choice selects an option, Score applies a defined rubric, and Noul returns a yes/no probability. The application would store those signals in candidate_job_matches and link them to separately preserved résumé evidence. Jev does not write explanations or outreach. This demo uses keyword rules, not Jev results.",
      benefit:
        "Give recruiters a starting point and questions to ask, not an automatic hiring decision.",
    },
    {
      icon: LayoutDashboard,
      title: "Make the human connection",
      tech: "Recruiter dashboard + Aaron",
      text: "Recruiters review profiles and role context. Aaron could use a generative LLM or a template for written follow-up, with human review before outreach. That is a separate job from Jev’s typed judgments. This demo prepares an editable template and does not connect to Aaron.",
      benefit: "More relevant conversations, with a person in control.",
    },
  ];
  const node = nodes[active];
  const Icon = node.icon;
  return (
    <div className="explain-page">
      <div className="eyebrow">YOUR PROPOSED ARCHITECTURE</div>
      <h1>
        One introduction.
        <br />A connected journey.
      </h1>
      <p className="lead">
        A focused addition to the existing site, with useful context at every
        step.
      </p>
      <div className="architecture-layout">
        <div className="architecture-flow">
          {nodes.map((item, index) => {
            const StepIcon = item.icon;
            return (
              <div key={item.title}>
                <button
                  className={`flow-node ${index === active ? "selected" : ""}`}
                  aria-pressed={index === active}
                  onClick={() => onSelect(index)}
                >
                  <span className="flow-number">0{index + 1}</span>
                  <StepIcon size={21} />
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.tech}</small>
                  </div>
                  <ChevronRight size={18} />
                </button>
                {index < nodes.length - 1 && (
                  <ArrowDown className="flow-arrow" size={20} />
                )}
              </div>
            );
          })}
        </div>
        <aside className="architecture-detail" key={active}>
          <div className="large-symbol">
            <Icon size={34} />
          </div>
          <div className="eyebrow">STEP 0{active + 1}</div>
          <h2>{node.title}</h2>
          <Tag>{node.tech}</Tag>
          <p>{node.text}</p>
          <div className="benefit">
            <span>WHY IT MATTERS</span>
            <p>{node.benefit}</p>
          </div>
          <div className="simulation-note">
            <Clock3 size={17} />
            <p>
              This screen explains the planned system. The interactive demo runs
              entirely in browser memory.
            </p>
          </div>
        </aside>
      </div>
      <section className="jev-explainer" aria-label="Jev and generative AI">
        <div className="eyebrow">DIFFERENT TOOLS FOR DIFFERENT JOBS</div>
        <h2>Jev judges a defined question. An LLM can write the message.</h2>
        <div className="jev-columns">
          <div>
            <h3>Jev: structured signals</h3>
            <p>
              Evaluate the extracted evidence against a narrow question. The
              answer comes back as a typed value, not a generated paragraph.
            </p>
            <dl>
              <dt>Choice</dt>
              <dd>
                Which practice area does this experience describe? Include
                “other.”
              </dd>
              <dt>Score</dt>
              <dd>
                Where does the supplied evidence fall on a clearly defined
                rubric?
              </dd>
              <dt>Noul</dt>
              <dd>Does the résumé explicitly describe using Python at work?</dd>
            </dl>
          </div>
          <div>
            <h3>Generative LLM: language work</h3>
            <p>
              Generate a summary or write a personal follow-up from verified
              context. LLMs can also return structured outputs; Jev is
              purpose-built for bounded decisions.
            </p>
            <h3>The application still owns the workflow</h3>
            <p>
              Extract text first. Preserve source evidence. Validate responses,
              handle uncertainty, and leave candidate decisions with a
              recruiter. A probability is not a percentage of job fit.
            </p>
            <a
              href="https://docs.typesafe.ai/introduction"
              target="_blank"
              rel="noreferrer"
            >
              Read TypeSafe’s explanation <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
        <p className="method-note">
          Proposed integration only. No Jev calls, measured cost savings, or
          model-quality claims in this demo.
        </p>
      </section>
      <div className="failure-controls">
        <div>
          <h3>Try the recovery path</h3>
          <p>
            Pause résumé processing after receipt, then retry it from the
            recruiter’s view.
          </p>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => onFail(e.target.checked)}
          />
          Simulate a processing failure
        </label>
        <button className="button secondary" onClick={onStart}>
          Try a submission <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
