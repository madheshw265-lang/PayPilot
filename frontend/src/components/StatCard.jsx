export default function StatCard({ label, value, note, icon: Icon }) {
  return <div className="glass rounded-2xl p-5 shadow-glow">
    <div className="flex items-center justify-between text-slate-400"><span className="text-sm">{label}</span><span className="rounded-xl bg-white/5 p-2 text-emerald-300"><Icon size={17}/></span></div>
    <div className="mt-4 font-display text-2xl font-semibold text-white">{value}</div>
    <div className="mt-1 text-xs text-slate-500">{note}</div>
  </div>
}
