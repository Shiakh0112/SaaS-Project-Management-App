import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../app/slices/authSlice';
import {
  FiUser, FiLogOut, FiLayout, FiMenu, FiX,
  FiCheckSquare, FiUsers, FiFolder, FiBell, FiBarChart2, FiShield,
  FiArrowRight, FiCheck,
} from 'react-icons/fi';
import { MdOutlineSpaceDashboard } from 'react-icons/md';

const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Testimonials'];

const FEATURES = [
  { icon: FiCheckSquare,  title: 'Kanban Boards',       desc: 'Visualize your workflow with drag-and-drop boards. Move tasks across stages effortlessly.' },
  { icon: FiUsers,        title: 'Team Collaboration',   desc: 'Invite teammates, assign roles, and work together in real-time with live updates.' },
  { icon: FiFolder,       title: 'Project Management',   desc: 'Organize work into projects, set deadlines, track progress, and never miss a milestone.' },
  { icon: FiBell,         title: 'Smart Notifications',  desc: 'Stay informed with instant notifications for task updates, mentions, and deadlines.' },
  { icon: FiBarChart2,    title: 'Progress Tracking',    desc: "Get a bird's-eye view of your team's progress with dashboards and activity feeds." },
  { icon: FiShield,       title: 'Role-Based Access',    desc: 'Control who sees what. Assign Admin, Manager, or Member roles to keep data secure.' },
];

const STEPS = [
  { step: '01', title: 'Create a Project', desc: 'Set up your project in seconds. Add a name, description, and invite your team.' },
  { step: '02', title: 'Build Your Board', desc: 'Create lists like To Do, In Progress, Done — or customize to fit your workflow.' },
  { step: '03', title: 'Add & Assign Tasks', desc: 'Create tasks, set priorities, attach files, and assign them to team members.' },
  { step: '04', title: 'Ship Faster', desc: 'Track progress in real-time, get notified on updates, and deliver on time.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['3 Projects', '5 Team Members', 'Basic Boards', 'Email Notifications'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: 'per month',
    features: ['Unlimited Projects', '25 Team Members', 'Advanced Boards', 'Priority Support', 'File Attachments', 'Analytics Dashboard'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '₹1,999',
    period: 'per month',
    features: ['Unlimited Everything', 'Unlimited Members', 'Custom Roles & Permissions', 'Dedicated Support', 'SSO & Advanced Security', 'Custom Integrations'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Product Manager, TechCorp',
    avatar: 'PS',
    text: 'This tool completely transformed how our team works. We shipped 40% faster in the first month alone.',
  },
  {
    name: 'Rahul Verma',
    role: 'CTO, StartupHub',
    avatar: 'RV',
    text: 'The Kanban boards are incredibly intuitive. Our remote team finally has a single source of truth.',
  },
  {
    name: 'Aisha Khan',
    role: 'Engineering Lead, DevStudio',
    avatar: 'AK',
    text: 'Role-based access and real-time notifications are game changers. Highly recommend for any growing team.',
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-primary-600">TaskFlow</span>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l}
                onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {l}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <FiUser size={14} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </div>
                <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
                  <FiLayout size={14} /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))} className="text-left text-gray-700 dark:text-gray-300">
                {l}
              </button>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                  <FiLayout size={15} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white text-center px-4 py-2 rounded-lg font-semibold">
                  <FiLogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-300">Log in</Link>
                <Link to="/register" className="bg-primary-600 text-white text-center py-2 rounded-lg font-semibold">Get Started Free</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
            Project Management Reimagined
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Manage Projects,{' '}
            <span className="text-primary-600">Ship Faster,</span>
            <br />
            Together.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            TaskFlow combines the simplicity of Trello with the power of Notion. Boards, tasks, teams, and real-time collaboration — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-primary-200 dark:shadow-none">
              Start for Free — No Credit Card
            </Link>
            <button onClick={() => scrollTo('how-it-works')} className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-400 font-semibold px-8 py-3.5 rounded-xl text-base transition-colors flex items-center gap-2 justify-center">
              See How It Works <FiArrowRight size={16} />
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">Trusted by 10,000+ teams worldwide</p>
        </div>

        {/* Mock UI Preview */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">TaskFlow — My Workspace</span>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4 min-h-48">
            {[
              { label: 'To Do',       Icon: FiCheckSquare, color: 'text-blue-500',   count: 4 },
              { label: 'In Progress', Icon: FiLayout,      color: 'text-yellow-500', count: 3 },
              { label: 'Done',        Icon: FiCheck,       color: 'text-green-500',  count: 2 },
            ].map(({ label, Icon, color, count }, i) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <Icon size={13} className={color} />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
                </div>
                {[...Array(count)].map((_, j) => (
                  <div key={j} className="bg-white dark:bg-gray-700 rounded-lg p-2.5 mb-2 shadow-sm">
                    <div className={`h-2 rounded bg-gray-200 dark:bg-gray-600 mb-1.5 ${j % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
                    <div className="h-1.5 rounded bg-gray-100 dark:bg-gray-600 w-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything your team needs</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Powerful features designed to help teams of all sizes plan, track, and deliver great work.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all group">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <f.icon size={22} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-gray-600 dark:text-gray-400">No complex setup. No training required. Just sign up and start shipping.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-primary-100 dark:bg-primary-900 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200 dark:shadow-none">
                    {s.step}
                  </div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600 dark:text-gray-400">Start free. Upgrade when your team grows.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-6 border flex flex-col ${
                  p.highlight
                    ? 'border-primary-500 bg-primary-600 text-white shadow-2xl shadow-primary-200 dark:shadow-none scale-105'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {p.highlight && (
                  <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full self-start mb-4">Most Popular</span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${p.highlight ? 'text-white' : ''}`}>{p.name}</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${p.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{p.price}</span>
                  <span className={`text-sm ml-1 ${p.highlight ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>/{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${p.highlight ? 'text-primary-50' : 'text-gray-600 dark:text-gray-400'}`}>
                      <FiCheck size={14} className={p.highlight ? 'text-white flex-shrink-0' : 'text-primary-500 flex-shrink-0'} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    p.highlight
                      ? 'bg-white text-primary-600 hover:bg-primary-50'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by teams everywhere</h2>
            <p className="text-gray-600 dark:text-gray-400">Don't take our word for it — hear from our users.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to transform how your team works?</h2>
          <p className="text-primary-100 mb-8 text-lg">Join 10,000+ teams already using TaskFlow. Free forever, no credit card required.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-xl">
            Get Started for Free <FiArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <span className="text-xl font-bold text-white block mb-3">TaskFlow</span>
              <p className="text-sm leading-relaxed">The modern project management tool for teams that want to move fast and stay organized.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Documentation', 'Help Center', 'Contact', 'Status'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white font-semibold mb-3 text-sm">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 TaskFlow. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
