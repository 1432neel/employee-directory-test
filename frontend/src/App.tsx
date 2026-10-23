import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Users, UserPlus, Search, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight, BriefcaseBusiness, Mail, Sparkles, RefreshCw } from 'lucide-react'
import { createEmployee, deleteEmployee, Employee, EmployeeInput, getEmployees, getErrorMessage, updateEmployee } from './api'

const emptyForm: EmployeeInput = { name: '', email: '', role: '' }
const pageSize = 6

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState<EmployeeInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadEmployees() {
    setLoading(true)
    setError('')
    try {
      setEmployees(await getEmployees())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadEmployees() }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return employees
    return employees.filter((employee) =>
      [employee.name, employee.email, employee.role].some((value) => value.toLowerCase().includes(term)),
    )
  }, [employees, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleEmployees = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => { setPage(1) }, [search])

  function startEdit(employee: Employee) {
    setEditingId(employee.id)
    setForm({ name: employee.name, email: employee.email, role: employee.role })
    setNotice('')
    document.getElementById('employee-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (editingId !== null) {
        await updateEmployee(editingId, form)
        setNotice('Employee details updated successfully.')
      } else {
        await createEmployee(form)
        setNotice('New employee added to your directory.')
      }
      resetForm()
      await loadEmployees()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(employee: Employee) {
    if (!window.confirm(`Delete ${employee.name} from the directory? This action cannot be undone.`)) return
    setError('')
    setNotice('')
    try {
      await deleteEmployee(employee.id)
      setEmployees((current) => current.filter((item) => item.id !== employee.id))
      setNotice(`${employee.name} was deleted.`)
      if (visibleEmployees.length === 1 && page > 1) setPage(page - 1)
      if (editingId === employee.id) resetForm()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Users size={21} /></span><span>people<span className="brand-light">desk</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="nav-item active"><Users size={18} /><span>Employee directory</span><span className="nav-count">{employees.length}</span></div>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><Sparkles size={17} /></div><strong>People, made simple.</strong><p>A clear view of the people who make your team great.</p></div>
          <div className="profile"><div className="profile-avatar">PD</div><div><strong>PeopleDesk Admin</strong><small>Workspace owner</small></div><span className="status-dot" /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Employee directory</strong></div><div className="topbar-right"><span className="live-dot" /> All changes sync to your database</div></header>
        <div className="page-wrap">
          <section className="page-heading">
            <div><div className="eyebrow">YOUR TEAM, AT A GLANCE</div><h1>Employee directory</h1><p className="subtitle">Manage your people, their details, and the roles they play.</p></div>
            <button className="primary-button" onClick={() => { resetForm(); document.getElementById('name')?.focus() }}><UserPlus size={17} /> Add employee</button>
          </section>

          {error && <div className="alert error-alert" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
          {notice && <div className="alert success-alert" role="status"><Check size={17} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={16} /></button></div>}

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Total employees</span><span className="stat-icon purple"><Users size={18} /></span></div><div className="stat-number">{employees.length}</div><div className="stat-foot">People in your directory</div></div>
            <div className="stat-card"><div className="stat-top"><span>Unique roles</span><span className="stat-icon blue"><BriefcaseBusiness size={18} /></span></div><div className="stat-number">{new Set(employees.map((e) => e.role.toLowerCase())).size}</div><div className="stat-foot">Across the team</div></div>
            <div className="stat-card"><div className="stat-top"><span>Directory status</span><span className="stat-icon green"><Check size={18} /></span></div><div className="stat-number status-number">Active</div><div className="stat-foot"><span className="mini-green-dot" /> Connected to employee API</div></div>
          </section>

          <section className="directory-panel">
            <div className="panel-heading"><div><h2>All employees</h2><p>Browse and manage employee records</p></div><button className="icon-button refresh-button" onClick={() => void loadEmployees()} title="Refresh list" aria-label="Refresh list"><RefreshCw size={17} /></button></div>
            <div className="toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search employees" placeholder="Search by name, email, or role..." value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></div><div className="result-count">{filtered.length} {filtered.length === 1 ? 'employee' : 'employees'}</div></div>
            <div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>ROLE</th><th>DATE ADDED</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>
              {loading ? <tr><td colSpan={4}><div className="loading-state"><span className="spinner" /> Loading employees...</div></td></tr> :
                visibleEmployees.length === 0 ? <tr><td colSpan={4}><div className="empty-state"><div className="empty-icon"><Users size={24} /></div><strong>{search ? 'No matching employees' : 'Your directory is ready'}</strong><p>{search ? 'Try a different name, email, or role.' : 'Add your first employee to get started.'}</p>{!search && <button className="text-button" onClick={() => document.getElementById('name')?.focus()}>Add an employee <span>→</span></button>}</div></td></tr> :
                visibleEmployees.map((employee, index) => <tr key={employee.id}><td><div className="employee-cell"><div className={`avatar avatar-${index % 5}`}>{initials(employee.name)}</div><div className="employee-info"><strong>{employee.name}</strong><span><Mail size={13} /> {employee.email}</span></div></div></td><td><span className="role-pill">{employee.role}</span></td><td className="date-cell">{formatDate(employee.created_at)}</td><td><div className="row-actions"><button className="action-button edit-action" onClick={() => startEdit(employee)} title={`Edit ${employee.name}`} aria-label={`Edit ${employee.name}`}><Pencil size={15} /><span>Edit</span></button><button className="action-button delete-action" onClick={() => void handleDelete(employee)} title={`Delete ${employee.name}`} aria-label={`Delete ${employee.name}`}><Trash2 size={15} /></button></div></td></tr>)
              }
            </tbody></table></div>
            <div className="table-footer"><span>Showing <strong>{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> results</span><div className="pagination"><button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page"><ChevronLeft size={16} /></button><span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span><button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page"><ChevronRight size={16} /></button></div></div>
          </section>

          <section className="form-panel" id="employee-form">
            <div className="form-heading"><div className="form-heading-icon"><UserPlus size={19} /></div><div><h2>{editingId !== null ? 'Edit employee' : 'Add a new employee'}</h2><p>{editingId !== null ? 'Update the employee details below.' : 'Fill in the details to add someone to your team.'}</p></div>{editingId !== null && <button className="cancel-edit" onClick={resetForm}><X size={15} /> Cancel edit</button>}</div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid"><label className="field"><span>Full name <i>*</i></span><input id="name" required maxLength={120} placeholder="e.g. Ananya Patel" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="field"><span>Email address <i>*</i></span><input required type="email" maxLength={190} placeholder="ananya@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label className="field"><span>Job role <i>*</i></span><input required maxLength={120} placeholder="e.g. Product Designer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></label></div>
              <div className="form-actions"><span className="required-note"><i>*</i> Required fields</span><div className="form-buttons">{editingId !== null && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}<button type="submit" className="primary-button" disabled={saving}>{saving ? <><span className="button-spinner" /> Saving...</> : <>{editingId !== null ? <Check size={16} /> : <UserPlus size={16} />}{editingId !== null ? 'Save changes' : 'Create employee'}</>}</button></div></div>
            </form>
          </section>
          <footer className="footer"><span>© 2026 PeopleDesk</span><span>Built for better teamwork <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>
    </div>
  )
}
