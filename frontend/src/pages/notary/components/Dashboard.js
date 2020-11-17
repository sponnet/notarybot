import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { send } from '@giantmachines/redux-websocket';
import config from "../../../config.js";
import Back from "../../../components/Back.js";

const isIPFS = require('is-ipfs');
const IPFS = require('ipfs-mini');
const ipfs = new IPFS(config.ipfshost);

const PAGESIZE = 10;

const NotaryBlock = ({ amount, hash, txhash }) => {

    const [hashes, setHashes] = useState();

    // given the notarized IPFS hash
    // give a list with hashes of files that were notarized
    const loadHashes = async (hash) => {
        const r = await ipfs.catJSON(hash);
        if (r) {
            setHashes(r.hashes);
        }
    }

    const hashesDesc = (amount) => {
        if (amount === 0) {
            return "0 hashes";
        }
        if (amount === 1) {
            return "1 hash";
        }
        return `${amount} hashes`;
    }

    return (<div key={hash} className="timeline-item">
        <div className="timeline-marker"></div>
        <div className="timeline-content">
            <p>
                <a href={`${config.txeplorerurl}/${txhash}`}>{txhash}</a>
            </p>
            <p>
                <a href={`${config.ipfsgw}/${hash}`}>{hash}</a>
            </p>
            {hashes ? (
                <>
                    <div onClick={() => setHashes(null)}>hide</div>
                    <ul>{hashes.map((hash) => { return (<li>{hash}</li>) })}</ul>
                </>
            ) : (
                    <div onClick={() => loadHashes(hash)}>show notarized hashes ({hashesDesc(amount)})</div>
                )}
        </div>
    </div>)
}

const Comp = ({ parentpath, txhash, roothash }) => {

    const readHash = async (hash, txhash, depth, accum = []) => {
        setLastHash(null);
        setLastTx(null);
        setLoading(true);
        const r = await ipfs.catJSON(hash);
        console.log(r);
        const hashesNotarized = r.hashes ? r.hashes.length : 0;
        accum.push((<NotaryBlock key={hash} amount={hashesNotarized} hash={hash} txhash={txhash} />));

        if (depth <= 0 || !isIPFS.multihash(r.parenthash)) {
            console.log("SetTimeline goddomme->", accum, hash, r.parenthash);
            setTimeLine([...timeLine, ...accum]);
            setLastHash(r.parenthash);
            setLastTx(r.parenttx);
            setLoading(false);
        } else {
            console.log("ga dieper goddomme ->", r.parenthash);
            readHash(r.parenthash, r.parenttx, depth - 1, accum);
        }
    }

    const readHashCBH = useCallback((roothash, txhash, PAGESIZE) => {
        readHash(roothash, txhash, PAGESIZE);
    }, [])

    useEffect(() => {
        if (roothash && txhash) {
            readHashCBH(roothash, txhash, PAGESIZE);
        }
    }, [roothash, txhash]);

    const [timeLine, setTimeLine] = useState([]);
    const [lastHash, setLastHash] = useState();
    const [lastTx, setLastTx] = useState();
    const [loading, setLoading] = useState(false);

    return (
        <div className="container">
            <Back to={`${parentpath}/`} ></Back>

            <h2 className="is-size-2">The notary</h2>
            <div className="timeline">
                {timeLine}
                {!loading && (
                    <>
                        {lastHash && lastHash.length > 1 && lastTx ? (
                            <div className="timeline-header">
                                <span className="tag is-medium is-primary" onClick={() => { readHash(lastHash, lastTx, PAGESIZE) }}>Load more</span>

                                {lastHash}, {lastTx}                            </div>
                        ) : (
                                <div className="timeline-header">
                                    <span className="tag is-medium is-primary">Start</span>
                                </div>
                            )}
                    </>
                )}
            </div>

        </div>
    )
};

const mapStateToProps = state => {
    return {
        totalhashes: state.main.totalhashes,
        hashqueue: state.main.hashqueue,
        nextnotaryevent: state.main.nextnotaryevent,
        hashesqueuelength: state.main.hashesqueuelength,
        txhash: state.main.txhash,
        roothash: state.main.roothash
    };
};

const mapDispachToProps = dispatch => {
    return {
        queueHashes: (hashes) => dispatch({ type: "QUEUEHASHES", hashes: hashes }),
        sendMessage: (message) => dispatch(send({ command: message })),
    };
};

export default connect(
    mapStateToProps,
    mapDispachToProps
)(Comp);
