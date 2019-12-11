import React from "react";
import { connect } from "react-redux";
import DownloadLink from "react-download-link";
import { Link } from "react-router-dom";

const Comp = ({ wallet, ownershipproofs, setOwnershipProofs }) => {

    if (!wallet) {
        return (<div>No wallet</div>);
    }

    return (
        <div>
            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input checked={ownershipproofs} onChange={(e) => { setOwnershipProofs(e.target.checked) }} type="checkbox" />
                        <span>&nbsp;Include Proof-Of-Ownership</span>
                    </label>
                </div>
            </div>
            {ownershipproofs && (
                <>
                    <div>
                        <span>Signing identity is </span>
                        <Link
                            to={{
                                pathname: "/me"
                            }}
                        >{wallet.address}
                        </Link>
                    </div>
                </>
            )}
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
