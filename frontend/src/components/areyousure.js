import { confirmAlert } from 'react-confirm-alert'; // Import
import React from "react";

const areyousure = (title, description, yes, no) => {
    confirmAlert({
        customUI: ({ onClose }) => {
            return (
                <div className="modal is-active">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <header className="modal-card-head">
                            <p className="modal-card-title">{title}</p>
                            <button className="delete" onClick={onClose} aria-label="close"></button>
                        </header>
                        <section className="modal-card-body">
                            {description}
                        </section>
                        <footer className="modal-card-foot">

                            <div
                                className="button relai-action-large is-rounded is-medium is-fullwidth"
                                onClick={() => {
                                    yes.onYes();
                                    onClose();
                                }}
                            >
                                <span className="relai-action-large-padding">{yes.description || (<>YES</>)}</span>
                            </div>

                            <div
                                className="button relai-action-large inactive is-rounded is-medium is-fullwidth"
                                onClick={() => {
                                    no && no.onNo();
                                    onClose();
                                }}
                            >
                                <span className="relai-action-large-padding">{no ? (<>no.description</>) : (<>NO</>)}</span>
                            </div>

                        </footer>
                    </div>
                </div>
            );
        }
    });
}

export default areyousure;
