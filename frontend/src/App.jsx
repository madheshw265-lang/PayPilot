import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownLeft, ArrowUpRight, Bot, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, CreditCard, FileText, LoaderCircle, MessageSquareText, Plus, RefreshCw, ShieldCheck, Sparkles, WalletCards, X } from 'lucide-react'
import { api } from './lib/api'
import StatCard from './components/StatCard'

const money = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount || 0))
const sample = 'Customer Alex ordered 2 wireless headphones at 45 dollars each and 1 USB-C cable at 12 dollars.'

export default function App() {
  const [message, setMessage] = useState(sample)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState([])
  const [apiOnline, setApiOnline] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const total = useMemo(() => order?.items?.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0) || 0, [order])

  async function refresh() {
    try {
      await api.health()
      setApiOnline(true)
      setTransactions(await api.transactions())
    } catch { setApiOnline(false) }
  }
  useEffect(() => { refresh() }, [])

  async function extractOrder() {
    setLoading(true); setError(''); setNotice('')
    try {
      const parsed = await api.parseOrder(message)
      setOrder(parsed)
      setNotice('Order extracted. Review every item and price before creating a payment link.')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function updateItem(index, key, value) {
    setOrder(current => ({ ...current, items: current.items.map((item, i) => i === index ? { ...item, [key]: key === 'name' ? value : Number(value) } : item) }))
  }
  function addItem() { setOrder(current => ({ ...current, items: [...current.items, { name: 'New product', quantity: 1, unit_price: 10 }] })) }
  function removeItem(index) { setOrder(current => ({ ...current, items: current.items.filter((_, i) => i !== index) })) }

  async function createPayment() {
    setPaymentLoading(true); setError(''); setNotice('')
    try {
      const result = await api.createOrder(order.customer_name || 'Customer', order.items)
      if (!result.approve_url) throw new Error('PayPal did not return a checkout approval URL.')
      setCheckoutUrl(result.approve_url)
      setNotice(`PayPal Sandbox order ${result.id} created. Open the PayPal checkout link below, approve the payment, then return and click Verify payment.`)
      setOrder(current => ({ ...current, paypalOrderId: result.id, amount: result.amount, currency: result.currency }))
      await refresh()
    } catch (e) { setError(e.message) } finally { setPaymentLoading(false) }
  }

  async function verifyPayment() {
    if (!order?.paypalOrderId) return
    setPaymentLoading(true); setError('')
    try {
      const result = await api.capture(order.paypalOrderId)
      if (result.status === 'COMPLETED') setNotice('Payment captured and verified successfully in PayPal Sandbox.')
      else setNotice(`PayPal returned status: ${result.status}. Check the transaction before treating it as paid.`)
      await refresh()
    } catch (e) { setError(e.message) } finally { setPaymentLoading(false) }
  }

  return <div className="min-h-screen text-slate-100">
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300 text-slate-950"><WalletCards size={23}/></div><div><div className="font-display text-xl font-bold tracking-tight">PayPilot <span className="text-emerald-300">AI</span></div><div className="text-xs text-slate-500">Autonomous commerce assistant</div></div></div>
        <div className="flex items-center gap-3"><span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"><span className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}/>{apiOnline ? 'API connected' : 'API offline'}</span><button onClick={refresh} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white" title="Refresh"><RefreshCw size={16}/></button><div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-400/20 text-sm font-semibold text-indigo-200">P</div></div>
      </header>

      <main className="py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-emerald-300"><Sparkles size={14}/> Seller workspace</div><h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Good afternoon, <span className="text-slate-400">Seller.</span></h1><p className="mt-2 max-w-xl text-sm text-slate-400">Turn customer messages into ready-to-pay orders with your AI commerce copilot.</p></div><div className="flex gap-2"><button onClick={() => setActiveTab('overview')} className={`rounded-xl px-4 py-2 text-sm ${activeTab === 'overview' ? 'bg-white text-slate-900' : 'border border-white/10 text-slate-400'}`}>Overview</button><button onClick={() => setActiveTab('transactions')} className={`rounded-xl px-4 py-2 text-sm ${activeTab === 'transactions' ? 'bg-white text-slate-900' : 'border border-white/10 text-slate-400'}`}>Transactions</button></div></div>

        {activeTab === 'overview' ? <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total transactions" value={transactions.length} note="Sandbox orders created" icon={Activity}/><StatCard label="Completed payments" value={transactions.filter(t => t.status === 'COMPLETED').length} note="Verified captures" icon={CheckCircle2}/><StatCard label="Pending payments" value={transactions.filter(t => t.status !== 'COMPLETED').length} note="Awaiting completion" icon={Clock3}/><StatCard label="Payment provider" value="PayPal" note="Developer Sandbox" icon={CreditCard}/></section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <div className="glass rounded-3xl p-5 md:p-7"><div className="mb-6 flex items-center justify-between"><div><div className="flex items-center gap-2 text-sm font-semibold"><Bot size={18} className="text-emerald-300"/> AI Order Assistant</div><p className="mt-1 text-xs text-slate-500">Describe an order in plain English</p></div><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">Gemini powered</span></div>
              <label className="mb-2 block text-xs font-medium text-slate-400">Customer order message</label><textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Example: Alex ordered 2 coffee mugs at $15 each..." className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200 outline-none transition focus:border-emerald-300/50"/>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><button onClick={() => setMessage(sample)} className="text-xs text-slate-500 hover:text-slate-300">Load sample order</button><button disabled={loading || !message.trim() || !apiOnline} onClick={extractOrder} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <Sparkles size={16}/>} {loading ? 'Extracting...' : 'Extract order'}</button></div>
              {error && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</div>}{notice && <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs leading-5 text-emerald-100">{notice}</div>}
            </div>

            <div className="glass rounded-3xl p-5 md:p-7"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2 text-sm font-semibold"><FileText size={18} className="text-indigo-300"/> Invoice preview</div><p className="mt-1 text-xs text-slate-500">Review the AI-extracted order</p></div><span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-slate-400">DRAFT</span></div>
              {order ? <><div className="mb-4"><label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Customer</label><input value={order.customer_name || ''} onChange={e => setOrder({ ...order, customer_name: e.target.value })} className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm outline-none focus:border-emerald-300/50"/></div><div className="space-y-3">{order.items.map((item, index) => <div key={index} className="grid grid-cols-[1fr_58px_84px_26px] items-center gap-2"><input value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} className="min-w-0 rounded-lg border border-white/10 bg-slate-950/50 px-2 py-2 text-xs outline-none"/><input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-2 py-2 text-xs outline-none"/><input type="number" min="0.01" step="0.01" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-2 py-2 text-xs outline-none"/><button onClick={() => removeItem(index)} className="text-slate-600 hover:text-rose-300"><X size={15}/></button></div>)}</div><button onClick={addItem} className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200"><Plus size={14}/> Add item</button><div className="my-5 border-t border-white/10"/><div className="flex items-end justify-between"><span className="text-xs text-slate-400">Estimated total · {order.currency || 'USD'}</span><span className="font-display text-2xl font-bold">{money(total, order.currency || 'USD')}</span></div><button disabled={paymentLoading || !order.items.length || Boolean(order.paypalOrderId)} onClick={createPayment} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40">{paymentLoading ? <LoaderCircle size={16} className="animate-spin"/> : <CreditCard size={16}/>} Create PayPal checkout <ChevronRight size={16}/></button>{order.paypalOrderId && <><a href={checkoutUrl} target="_blank" rel="noreferrer" className="mt-2 flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:bg-white/5">Open PayPal checkout <ChevronRight size={15} className="ml-1"/></a><button onClick={verifyPayment} disabled={paymentLoading} className="mt-2 w-full rounded-xl border border-emerald-300/30 px-4 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-300/10 disabled:opacity-40">Verify / capture payment</button></>}</> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-400/10 text-indigo-300"><FileText size={25}/></div><p className="text-sm font-medium text-slate-300">Your invoice will appear here</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Enter an order message and let Gemini extract the details to get started.</p></div>}
            </div>
          </section>
          <section className="glass mt-6 rounded-3xl p-5 md:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Recent transactions</h2><p className="mt-1 text-xs text-slate-500">Latest PayPal Sandbox activity</p></div><button onClick={() => setActiveTab('transactions')} className="text-xs text-emerald-300">View all</button></div><TransactionTable rows={transactions.slice(0, 5)}/></section>
        </> : <section className="glass rounded-3xl p-5 md:p-7"><div className="mb-5"><h2 className="text-lg font-semibold">All transactions</h2><p className="mt-1 text-xs text-slate-500">Your latest 50 PayPal Sandbox orders</p></div><TransactionTable rows={transactions}/></section>}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-slate-600"><span>© 2026 PayPilot AI · Hackathon MVP</span><span className="flex items-center gap-2"><ShieldCheck size={13}/> Sandbox mode · No live payments</span></footer>
      </main>
    </div>
  </div>
}

function TransactionTable({ rows }) {
  if (!rows.length) return <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-xs text-slate-500">No transactions yet. Create your first AI-powered order.</div>
  return <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="pb-3 font-medium">Order ID</th><th className="pb-3 font-medium">Description</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-white/5"><td className="py-4 font-mono text-slate-400">{row.paypal_order_id.slice(0, 12)}…</td><td className="py-4 text-slate-300">{row.description}</td><td className="py-4 text-slate-500">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td><td className="py-4 font-semibold text-white">{money(row.amount, row.currency)}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] ${row.status === 'COMPLETED' ? 'bg-emerald-300/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>{row.status}</span></td></tr>)}</tbody></table></div>
}
