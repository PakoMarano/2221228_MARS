import React from "react";

const Card = ({ header, children, className = "" }) => {
    return (
        <div
            className={`card-container ${className}`}
        >
            <div className="card-header">
                {header}
            </div>
            <hr className="card-separator" />
            <div className="card-content">
                {children}
            </div>
        </div>
    );
};

export default Card;