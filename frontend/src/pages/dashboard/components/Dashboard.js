import React, { useEffect } from "react";
import { connect } from "react-redux";
import Dropzone from 'react-dropzone'
import { send } from '@giantmachines/redux-websocket';
import ReactMomentCountDown from 'react-moment-countdown';
import config from "../../../config.js";
import Moment from 'react-moment';
import { Link } from "react-router-dom";
import { faCheck, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { publicationStatus } from "../../../lib/api";
import Identity from "../../../components/Identity";
import moment from 'moment'

const Comp = ({ addFiles, files, proofs, totalhashes, clearFiles, txhash, roothash, indexupdated, hashesqueuelength, queueHashes, nextnotaryevent, sendMessage }) => {

    const [newItemsCount, setNewItemsCount] = React.useState([]);
    const [nextEventDate, setNextEventDate] = React.useState();

    const addHashes = () => {
        const rawHashArray = files ? files.map((hash) => { return hash.hash }) : null;
        console.log(rawHashArray);
        if (rawHashArray) {
            queueHashes(rawHashArray);
            sendMessage("getstats");
        }
    };

    useEffect(() => {
        const now = Date.now();
        if (nextnotaryevent && now < nextnotaryevent) {
            const nxt = moment(nextnotaryevent);
            console.log(`Setting new date ${nextnotaryevent}`, nxt);
            setNextEventDate(nxt);
        } else {
            setNextEventDate(null);
        }
    }, [nextnotaryevent]);

    // count the amount of new files
    useEffect(() => {
        const count = files.filter((file) => {
            return (file && file.status !== 3)
        }).length;
        setNewItemsCount(count);
    }, [files]);

    console.log("proofs", proofs);

    const q = files ? files.map((hash, i) => {
        const notarized = hash.status === 3;
        // if(proofs){
        //     debugger;
        // }
        const sig = proofs ? proofs.find((p) => {
            return p.hash === hash.hash
        }) : null;

        return (

            <article key={i} className="post">
                <div className="is-size-4">{hash.filename}</div>
                <div className="media">
                    <div className="media-content">
                        <div className="content">
                            <p>
                                {hash.status === publicationStatus.PUBLISHED && (
                                    <>
                                        {hash.metadata ? (
                                            <>
                                                was notarized at <Moment format="YYYY/MM/DD">{hash.metadata.timestamp}</Moment>
                                                &nbsp;
                                                <a href={`${config.txeplorerurl}/${hash.metadata.txhash}`} target="_new">

                                                    <span className="tag">
                                                        <span>in block {hash.metadata.blocknumber}</span>
                                                        <FontAwesomeIcon className="icon has-left-space is-small" icon={faSearch} />
                                                    </span>
                                                </a>
                                            </>) : (<>
                                                waiting for confirmation({hash.status})
                                                </>
                                            )}
                                    </>
                                )}
                                {hash.status === publicationStatus.QUEUED && (
                                    <>
                                        <span>Qeueud</span>
                                    </>
                                )}

                                {!hash.status && (
                                    <>
                                        <span>not notarized</span>
                                    </>

                                )}
                            </p>
                            {sig && (
                                <>signed</>
                            )}
                        </div>
                    </div>
                    <div className="media-right is-success">
                        {notarized && (
                            <FontAwesomeIcon className="icon is-success has-right-space is-medium" icon={faCheck} />
                        )}
                    </div>
                </div>
            </article>


        )
    }) : null;

    const hashList = q && q.length > 0 ? (
        <div className="column">
            <div className="box content">
                <h4 className="is-size-4">Files <div className="is-pulled-right"><button onClick={clearFiles} className="delete"></button></div></h4>
                {q}
            </div>
            {newItemsCount > 0 && (
                <>
                    <Identity />
                    <button onClick={() => { addHashes() }} className=" button">Notarize the hashes of these {newItemsCount} new file(s)</button>
                </>
            )}

        </div>
    ) : (
            <div className="column">
                <h2 className="is-size-3">The Notary bot</h2>
                <li>Performs free Notarization (Proof-Of-Existence) on Ethereum</li>
                <li>Generates free Digital Stamping Certificates</li>
                <li>Adds an identity signature if you want (Proof-Of-Ownership)</li>
                <li>Generates Ownership certificates</li>
                <li>Lets you to download your  <Link
                    to={{
                        pathname: "/me"
                    }}
                >identity keypair</Link></li>
            </div>

        );

    return (
        <div className="container">
            <nav className="level">
                <div className="level-item has-text-centered">
                    <div>
                        <p className="heading">Next Notary Event</p>
                        <p className="title">{nextEventDate ? (
                            <>
                                <ReactMomentCountDown
                                    toDate={nextEventDate}
                                    onCountdownEnd={() => {
                                        setNextEventDate(null)
                                    }}
                                />
                            </>
                        ) : (<span>&nbsp;</span>)}</p>
                        <span className="is-size-7">
                            <Link

                                to={{
                                    pathname: "/notary"
                                }}
                            >timeline of notarizations</Link>
                        </span>
                    </div>
                </div>
                <div className="level-item has-text-centered">
                    <div>
                        <p className="heading">Hashes in queue</p>
                        <p className="title">{hashesqueuelength}</p>
                        <span className="is-size-7">&nbsp;</span>
                    </div>
                </div>
                <div className="level-item has-text-centered">
                    <div>
                        <p className="heading">Hashes notarized</p>
                        <p className="title">{totalhashes}</p>
                        <span className="is-size-7">&nbsp;</span>
                    </div>
                </div>
                <div className="level-item has-text-centered">
                    <div>
                        <p className="heading">My identity</p>
                        <p className="title"><Link
                            to={{
                                pathname: "/me"
                            }}
                        >Me</Link></p>
                        <span className="is-size-7">&nbsp;</span>
                    </div>
                </div>
            </nav>

            <div className="columns">

                {hashList}

                <div className="column">
                    <div className="tile">
                        <div className="dropzone">
                            <Dropzone onDrop={acceptedFiles => addFiles(acceptedFiles)}>
                                {({ getRootProps, getInputProps }) => (
                                    <section>
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <p className="dropzone-text">
                                                <span>Drag 'n' drop the files you want to verify or add, or click to select files</span><br />
                                                <span className="is-size-5">Note: Your files will NEVER be uploaded.</span>
                                            </p>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
};

const mapStateToProps = state => {
    return {
        totalhashes: state.main.totalhashes,
        // hashqueue: state.main.hashqueue,
        nextnotaryevent: state.main.nextnotaryevent,
        hashesqueuelength: state.main.hashesqueuelength,
        txhash: state.main.txhash,
        roothash: state.main.roothash,
        indexupdated: state.main.indexupdated,
        files: state.main.files,
        proofs: state.identity.proofs
    };
};

const mapDispachToProps = dispatch => {
    return {
        addFiles: (files) => dispatch({ type: "ADDFILES", files: files }),
        queueHashes: (hashes) => dispatch({ type: "QUEUEHASHES", hashes: hashes }),
        sendMessage: (message) => dispatch(send({ command: message })),
        clearFiles: (message) => dispatch({ type: "CLEARFILES" }),
    };
};

export default connect(
    mapStateToProps,
    mapDispachToProps
)(Comp);
