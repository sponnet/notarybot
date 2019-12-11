import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { send } from '@giantmachines/redux-websocket';
import config from "../../../config.js";
import { Link } from "react-router-dom";
import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DownloadLink from "react-download-link";
import Back from "../../../components/Back.js";

const Comp = ({ parentpath, wallet, ownershipproofs, setOwnershipProofs }) => {

    if (!wallet) {
        return (<div>No wallet</div>);
    }

    return (
        <div>
            <Back to={`${parentpath}/`} ></Back>
            <h2 className="is-size-2">My identity</h2>
            <span>Signing identity is </span>
            <Link
                to={{
                    pathname: "/me"
                }}
            >{wallet.address}
            </Link>

            <h2 className="is-size-2">Download a backup</h2>



            <DownloadLink
                className="button"
                label="Download Proof-Of-Ownership identity to disk"
                tagName="button"
                filename={`${wallet.address}.txt`}
                exportFile={() => wallet.privateKey}
            ></DownloadLink>

        </div>


    );
};


const mapStateToProps = state => {
    return {
        wallet: state.identity.wallet,
        ownershipproofs: state.identity.ownershipproofs
    };
};

const mapDispachToProps = dispatch => {
    return {
        setOwnershipProofs: (v) => dispatch({ type: "SETOWNERSHIPPROOFS", value: v }),
    };
};

export default connect(
    mapStateToProps,
    mapDispachToProps
)(Comp);
