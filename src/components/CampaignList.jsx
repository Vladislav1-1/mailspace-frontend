function CampaignList({ campaigns, onToggleStatus, onEdit, onDelete }) {
  if (campaigns.length === 0) {
    return <p className="empty-message">Рассылки не найдены</p>;
  }

  return (
    <section className="list-section">
      {campaigns.map(camp => (
        <div key={camp.id} className={`campaign-item status-${camp.status}`}>
          <div className="campaign-info">
            <h4>{camp.title}</h4>
            <p className="campaign-subject">Тема: {camp.subject}</p>
            <div className="campaign-meta">
              <span>Получателей: <b>{camp.recipientsCount}</b></span>
              <span>Создано: {camp.createdAt}</span>
              {camp.status === 'scheduled' && camp.scheduledDate && (
                <span className="scheduled-tag">Отправка: <b>{camp.scheduledDate}</b></span>
              )}
            </div>
          </div>

          <div className="campaign-actions">
            <button 
              className={`badge-status badge-${camp.status}`}
              onClick={() => onToggleStatus(camp.id)}
              title="Нажмите для смены статуса"
            >
              {camp.status}
            </button>
            <button onClick={() => onEdit(camp)} className="btn-icon edit-btn" title="Редактировать">✎</button>
            <button onClick={() => onDelete(camp.id)} className="btn-icon delete-btn" title="Удалить">✕</button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default CampaignList;