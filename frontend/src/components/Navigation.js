import React from "react";
import bender from "../assets/bender.png";
import config from "../config";
import { Link } from "react-router-dom";

const Comp = ({ location }) => {

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (

        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link
                    to={{
                        pathname: "/"
                    }}
                >
                    <figure className="image is-128x128">
                        <img className="is-rounded" alt="Robonotary" src={bender} />
                    </figure>
                </Link>
            </div>

            <div id="navbarBasicExample" className="navbar-menu">
                <div className="navbar-start">
                    <div className="navbar-item">
                        <h1 className="is-size-2">The Notarybot</h1>
                        {/* <h2 className="is-size-4">notarybot.eth ~ robonotary.eth</h2> */}
                    </div>
                    <div className="navbar-item">
                        {config.networknote && (
                            <span className="tag">
                                on {config.networknote}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </nav>


    );
};

export default Comp;