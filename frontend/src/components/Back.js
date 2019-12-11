import React from "react";
// import "./Navigation.scss";
import { Link } from "react-router-dom";
import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Comp = ({ children, to, before }) => {

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="level is-mobile">
            <div className="level-left">
                <div className="level-item">
                    <Link
                        onClick={() => { before && before(); }}
                        className="icon is-medium"
                        to={{
                            pathname: `${to}`
                        }}
                    >
                        <FontAwesomeIcon className="icon relai-dark-icon has-right-space is-medium" icon={faArrowCircleLeft} />
                    </Link>
                </div>
            </div>
            <div className="level-item">
                <h1 className="title has-text-centered is-vcentered is-size-5">{children}</h1>
            </div>
        </div>

    );
};

export default Comp;