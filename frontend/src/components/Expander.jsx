import { useState } from 'react';

const Expander = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`expander ${isOpen ? 'open' : ''}`}>
      <button type="button" className="expander-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span className="expander-icon">+</span>
      </button>
      <div className="expander-content">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Expander;
