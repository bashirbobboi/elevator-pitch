import './card.styles.css';

const Card = ({ children }) => {
  return (
    <div className="card-container">
      {children}
    </div>
  )
}

export default Card;
