import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import GuideArea from "@/components/ui/GuideArea";
import PillTag from "@/components/ui/PillTag";
import ProgressDots from "@/components/ui/ProgressDots";
import SandboxArea from "@/components/ui/SandboxArea";
import Stepper from "@/components/ui/Stepper";

export default function StyleguidePage() {
  return (
    <main className="p-10 space-y-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-semibold text-[var(--color-on-surface)] mb-1">Workbench Design System</h1>
        <p className="text-[var(--color-on-surface-variant)]">Stitch token verification — Phase 0</p>
      </div>

      {/* Typography */}
      <section className="space-y-3">
        <h2 className="text-2xl font-medium border-b border-[var(--color-outline-variant)] pb-2">Typography</h2>
        <h1 className="font-heading text-[2.5rem] font-semibold">Heading 1 — Lexend 40px</h1>
        <h2 className="font-heading text-[1.875rem] font-semibold">Heading 2 — Lexend 30px</h2>
        <h3 className="font-heading text-[1.5rem] font-medium">Heading 3 — Lexend 24px</h3>
        <p className="text-[1.125rem] leading-[1.6]">Body Large — Plus Jakarta Sans 18px with comfortable 1.6 line height for reading ease.</p>
        <p className="text-base leading-[1.6]">Body Medium — Plus Jakarta Sans 16px. Default body text size throughout the app.</p>
        <span className="font-heading text-xs font-semibold tracking-widest uppercase">Label Caps — Lexend 12px</span>
      </section>

      {/* Colors */}
      <section className="space-y-3">
        <h2 className="text-2xl font-medium border-b border-[var(--color-outline-variant)] pb-2">Colors</h2>
        <div className="flex gap-3 flex-wrap">
          {[
            ["Primary", "bg-[var(--color-primary)]"],
            ["Primary Container", "bg-[var(--color-primary-container)]"],
            ["Secondary Container", "bg-[var(--color-secondary-container)]"],
            ["Surface", "bg-[var(--color-surface)] border"],
            ["Surface Container", "bg-[var(--color-surface-container)]"],
            ["Error", "bg-[var(--color-error)]"],
          ].map(([name, cls]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <div className={`w-16 h-16 rounded-[var(--radius-lg)] ${cls}`} />
              <span className="text-xs text-[var(--color-on-surface-variant)]">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-3">
        <h2 className="text-2xl font-medium border-b border-[var(--color-outline-variant)] pb-2">Buttons</h2>
        <div className="flex gap-3 flex-wrap items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="motivational">Submit / Finish</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-3">
        <h2 className="text-2xl font-medium border-b border-[var(--color-outline-variant)] pb-2">Cards</h2>
        <div className="flex gap-4">
          <Card className="p-6 flex-1">
            <p className="font-semibold font-heading">Standard Card</p>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Level 1 — white surface with outline border</p>
          </Card>
          <Card elevated className="p-6 flex-1">
            <p className="font-semibold font-heading">Elevated Card</p>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Level 2 — teal tonal shadow for active focus</p>
          </Card>
        </div>
      </section>

      {/* Student/AI areas */}
      <section className="space-y-3">
        <h2 className="text-2xl font-medium border-b border-[var(--color-outline-variant)] pb-2">Workspace Areas</h2>
        <div className="flex gap-4">
          <SandboxArea className="p-6 flex-1">
            <p className="font-semibold font-heading">Sandbox (Student)</p>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Clean white — safe space for student input</p>
          </SandboxArea>
          <GuideArea className="p-6 flex-1 pt-8">
            <p className="font-semibold font-heading">Guide (AI)</p>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Teal-tinted with dashed border — generated content</p>
          </GuideArea>
        </div>
      </section>

      {/* Pill tags */}
      <section className="space-y-3">
        <h2 className="text-2xl font-medium border-b border-[var(--color-outline-variant)] pb-2">Pills & Tags</h2>
        <div className="flex gap-2 flex-wrap">
          <PillTag color="teal">Economics</PillTag>
          <PillTag color="amber">High Gate</PillTag>
          <PillTag color="neutral">Draft</PillTag>
          <PillTag color="teal">Progressive</PillTag>
          <PillTag color="amber">Needs Attention</PillTag>
        </div>
      </section>

      {/* Progress */}
      <section className="space-y-6">
        <h2 className="text-2xl font-medium border-b border-[var(--color-outline-variant)] pb-2">Progress Components</h2>
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">Journey Tracker (Progress Dots)</p>
          <div className="flex gap-4">
            <ProgressDots total={5} current={0} />
            <ProgressDots total={5} current={2} />
            <ProgressDots total={5} current={4} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">Stepper — step 2 active</p>
          <Stepper steps={["Reflect", "AI Assist", "Synthesize"]} currentStep={1} />
        </div>
      </section>
    </main>
  );
}
