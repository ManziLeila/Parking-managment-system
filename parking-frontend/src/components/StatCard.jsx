import PropTypes from 'prop-types';

export default function StatCard({ icon, label, value, trend, trendValue, color = 'primary' }) {
    const colorClasses = {
        primary: 'border-l-purple-500',
        success: 'border-l-green-500',
        warning: 'border-l-yellow-500',
        danger: 'border-l-red-500',
        info: 'border-l-blue-500'
    };

    return (
        <div className={`stat-card ${colorClasses[color]} fade-in-up`}>
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="stat-label">{label}</div>
                {icon && <div className="text-muted" style={{ fontSize: '1.5rem' }}>{icon}</div>}
            </div>

            <div className="stat-value">{value}</div>

            {trend && (
                <div className={`stat-trend ${trend}`}>
                    {trend === 'up' ? '↑' : '↓'}
                    <span>{trendValue}</span>
                </div>
            )}
        </div>
    );
}

StatCard.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    trend: PropTypes.oneOf(['up', 'down']),
    trendValue: PropTypes.string,
    color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info'])
};
