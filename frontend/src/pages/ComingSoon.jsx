import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import { PageHeader } from "../components/ui";

export default function ComingSoon({ title, text }) {
  return (
    <div>
      <PageHeader title={title} subtitle={text} />
      <div className="card flex flex-col items-center gap-3 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber/15 text-amber"><Construction size={30} /></span>
        <p className="text-xl font-semibold">Coming soon</p>
        <p className="max-w-md text-sm text-muted">The {title} page is part of the full FitNova app and is still being built. Try <b className="text-white">Water Intake</b> or <b className="text-white">Sleep</b> in the sidebar.</p>
        <div className="mt-3 flex gap-2"><Link to="/water" className="btn-primary">Water Intake</Link><Link to="/sleep" className="btn-ghost">Sleep</Link></div>
      </div>
    </div>
  );
}
