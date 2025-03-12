import React from 'react';
import './paginator.css';
import {
    KeyboardArrowLeft,
    KeyboardArrowRight,
    KeyboardDoubleArrowLeft,
    KeyboardDoubleArrowRight
} from "@mui/icons-material"; // Import the CSS file for styling

const Paginator = ({totalPages, setCurrentPage, currentPage}) => {
    return (
        <div style={{maxWidth:460, margin: "auto"}}>
            {totalPages > 1 ? (
                <div className="paginator-container">
                    <button
                        className={`paginator-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                    >
                        <KeyboardDoubleArrowLeft/>
                    </button>
                    <button
                        className={`paginator-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <KeyboardArrowLeft/>
                    </button>

                    <span className="page-info">
                        Strona
                        <form>
                            <input
                                type="number"
                                value={currentPage}
                                onChange={(e) => setCurrentPage(Math.max(1, Math.min(e.target.value, totalPages)))}
                                className="page-input"
                            />
                        </form> z {totalPages}
                    </span>

                    <button
                        className={`paginator-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <KeyboardArrowRight/>
                    </button>
                    <button
                        className={`paginator-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <KeyboardDoubleArrowRight/>
                    </button>
                </div>
            ) : totalPages < 1? <div>
                Nie znaleziono wyników.
            </div>: null}
        </div>
    );
};

export default Paginator;
