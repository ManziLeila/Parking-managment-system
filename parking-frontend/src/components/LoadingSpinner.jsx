import PropTypes from 'prop-types';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    const sizes = {
        sm: '24px',
        md: '40px',
        lg: '60px'
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
            <div
                className="spinner"
                style={{ width: sizes[size], height: sizes[size] }}
            />
            {text && <p className="mt-3 text-muted">{text}</p>}
        </div>
    );
}

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    text: PropTypes.string
};
