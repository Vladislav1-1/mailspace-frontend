import { useState, useEffect } from 'react';
import CampaignList from './components/CampaignList';
import { INITIAL_CAMPAIGNS } from './data/mockData';
import './App.css';

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [recipientsCount, setRecipientsCount] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('mailspace_campaigns');
    if (saved) {
      try {
        setCampaigns(JSON.parse(saved));
      } catch (e) {
        setCampaigns(INITIAL_CAMPAIGNS);
      }
    } else {
      setCampaigns(INITIAL_CAMPAIGNS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mailspace_campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns, isLoaded]);

  useEffect(() => {
    document.title = `MailSpace (${campaigns.length} рассылок)`;
  }, [campaigns]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !subject.trim()) {
      alert("Заполните название и тему рассылки!");
      return;
    }

    if (Number(recipientsCount) < 0) {
      alert("Количество получателей не может быть отрицательным числом!");
      return;
    }

    if (status === 'scheduled') {
      if (!scheduledDate) {
        alert("Для запланированной рассылки обязательно выберите дату!");
        return;
      }
      const selected = new Date(scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        alert("Дата отправки не может быть в прошлом!");
        return;
      }
    }

    if (editingId) {
      setCampaigns(prev => prev.map(item => 
        item.id === editingId 
          ? { 
              ...item, 
              title: title.trim(), 
              subject: subject.trim(), 
              status, 
              scheduledDate: status === 'scheduled' ? scheduledDate : '',
              recipientsCount: Number(recipientsCount) || 0 
            }
          : item
      ));
      setEditingId(null);
    } else {
      const newCampaign = {
        id: Date.now(),
        title: title.trim(),
        subject: subject.trim(),
        status,
        scheduledDate: status === 'scheduled' ? scheduledDate : '',
        recipientsCount: Number(recipientsCount) || 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCampaigns(prev => [newCampaign, ...prev]);
    }

    setTitle('');
    setSubject('');
    setStatus('draft');
    setScheduledDate('');
    setRecipientsCount('');
  };

  const handleDelete = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubject(item.subject);
    setStatus(item.status);
    setScheduledDate(item.scheduledDate || '');
    setRecipientsCount(item.recipientsCount);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setSubject('');
    setStatus('draft');
    setScheduledDate('');
    setRecipientsCount('');
  };

  const handleToggleStatus = (id) => {
    const cycle = { draft: 'scheduled', scheduled: 'sent', sent: 'draft' };
    setCampaigns(prev => prev.map(c => 
      c.id === id ? { ...c, status: cycle[c.status] } : c
    ));
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>MailSpace <span>Manager</span></h1>
        <p className="subtitle">Управление email-рассылками и статусами</p>
      </header>

      <section className="stats-panel">
        <div className="stat-card">Всего: <b>{stats.total}</b></div>
        <div className="stat-card stat-sent">Отправлено: <b>{stats.sent}</b></div>
        <div className="stat-card stat-scheduled">Запланировано: <b>{stats.scheduled}</b></div>
        <div className="stat-card stat-draft">Черновики: <b>{stats.draft}</b></div>
      </section>

      <section className="form-section">
        <h3>{editingId ? "Редактирование рассылки" : "Создать новую рассылку"}</h3>
        <form onSubmit={handleSubmit} className="campaign-form">
          <input 
            type="text" 
            placeholder="Название кампании" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Тема письма" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
          />
          <input 
            type="number" 
            min="0"
            placeholder="Получателей" 
            value={recipientsCount} 
            onChange={e => setRecipientsCount(e.target.value)} 
          />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="draft">Черновик</option>
            <option value="scheduled">Запланирована</option>
            <option value="sent">Отправлена</option>
          </select>

          {status === 'scheduled' && (
            <div className="date-input-group">
              <label>Дата запланированной отправки:</label>
              <input 
                type="date" 
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
              />
            </div>
          )}

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Сохранить изменения" : "Добавить рассылку"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="controls-section">
        <input 
          type="text" 
          placeholder="Поиск по названию или теме..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="filter-buttons">
          {['all', 'draft', 'scheduled', 'sent'].map(st => (
            <button 
              key={st}
              className={`filter-btn ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'all' ? 'Все' : st === 'draft' ? 'Черновики' : st === 'scheduled' ? 'Запланированные' : 'Отправленные'}
            </button>
          ))}
        </div>
      </section>

      <CampaignList 
        campaigns={filteredCampaigns}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;