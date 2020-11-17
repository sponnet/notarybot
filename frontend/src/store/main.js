
import { PromiseBlackBox } from '@oqton/redux-black-box';
import { postHash, verifyHashes, publicationStatus } from "../lib/api";
import ifpsonlyhash from 'ipfs-only-hash';

export const initialState = {
    socketconnected: false,
    hashqueue: [],
    files: [],
    totalhashes: null,
    nextnotaryevent: null,
}

const mergeFiles = (files, additions) => {
    // pass 1 : update existing
    const updatedFiles = files.map((file) => {
        const replacement = additions.find((item) => {
            return (item.hash === file.hash)
        });
        return replacement || file;
    });
    // pass 2 : add new
    return additions.reduce((accum, addedFile) => {
        if (!updatedFiles.find((file) => {
            return (file.hash === addedFile.hash)
        })) {
            accum.push(addedFile);
        }
        return accum;
    }, updatedFiles);
};

const reducer = (state = initialState, action) => {

    console.log(`reducer ${action.type}`);
    switch (action.type) {
        case "BOOTSTRAP":
            return {
                ...state,
                verifyfiles_bb: new PromiseBlackBox(res => ({ type: "VERIFYFILES" }))
            };
        case "REDUX_WEBSOCKET::CONNECT":
            return {
                socketconnected: true,
                sendMessage: action.sendMessage,
                ...state,
            };
        case "DISCONNECT":
            return {
                socketconnected: false,
                ...state,
            };

        case "CLEARFILES":
            return {
                ...state,
                files: [],
            }

        case "ADDFILES":
            return {
                ...state,
                addfiles_bb: new PromiseBlackBox(
                    () => {
                        return Promise.all(action.files.map((file) => {
                            return file.arrayBuffer().then((ab) => {
                                const data = Buffer.from(ab);
                                return ifpsonlyhash.of(data).then((hash) => {
                                    return ({
                                        filename: file.name,
                                        hash: hash,
                                    });
                                });
                            })
                        })
                        ).then(res => ({ type: "ADDFILES_SUCCESS", res }))
                            .catch(e => ({ type: "ADDFILES_ERROR", error: e }))
                    })
            };


        case "ADDFILES_SUCCESS":
            console.log("redux: files added");
            delete state.addfiles_bb;
            return {
                ...state,
                files: mergeFiles(state.files, action.res),
                verifyfiles_bb: new PromiseBlackBox(res => ({ type: "VERIFYFILES" }))
            }

        case "VERIFYFILES":
            const files = mergeFiles(state.files, action.res || []);
            console.log("redux: verfify files");
            delete state.addfiles_bb;

            return {
                ...state,
                files: files,
                verifyfiles_bb: new PromiseBlackBox(
                    () => {
                        // get an array with only the IPFS hashes
                        const rawhashes = files.reduce((accum, ho) => {
                            if (ho.status !== 3) {
                                accum.push(ho.hash);
                            }
                            return accum
                        }, []);
                        if (rawhashes.length === 0) {
                            return;
                        }
                        console.log("Post to verify", rawhashes);

                        return verifyHashes(rawhashes)
                            .then((verifiedHashes) => {
                                const enrichedHashQ = files.map((hashQItem) => {
                                    const enrichData = verifiedHashes.find((verifiedItem) => {
                                        return (verifiedItem.hash === hashQItem.hash);
                                    });
                                    if (enrichData) {
                                        return ({
                                            ...hashQItem,
                                            ...enrichData,
                                        })
                                    } else {
                                        return (hashQItem);
                                    }
                                })
                                console.log("Verification result", enrichedHashQ);
                                return Promise.resolve(enrichedHashQ);
                            })
                            .then(res => ({ type: "VERIFYFILES_SUCCESS", res }))
                            .catch(e => ({ type: "VERIFYFILES_ERROR", error: e }))
                    })
            }
        case "VERIFYFILES_SUCCESS":
            delete state.verifyfiles_bb;
            return {
                ...state,
                files: mergeFiles(state.files, action.res),
                signfiles_bb: new PromiseBlackBox(res => ({ type: "SIGNFILES" }))
            }
        case "VERIFYFILES_ERROR":
            delete state.verifyfiles_bb;
            console.log(action.error);
            return state;

        case "SIGNFILES":
            if (!state.files) {
                return state;
            }

            const hashesToSign = state.files.reduce((accum, ho) => {
                if (ho.status !== 3 && !ho.signature) {
                    accum.push(ho.hash);
                }
                return accum
            }, []);

            return {
                ...state,
                signfiles_bb: new PromiseBlackBox(
                    res => ({ type: "SIGNHASHES", hashes: hashesToSign }))

            }

        case "QUEUEHASHES":
            return {
                ...state,
                queuehash_bb: new PromiseBlackBox(
                    () => postHash(action.hashes)
                        .then(res => ({ type: "QUEUEHASHES_SUCCESS", hashes: action.hashes }))
                        .catch(e => ({ type: "QUEUEHASHES_ERROR", error: e }))
                )
            };

        case "QUEUEHASHES_SUCCESS":
            const updatedFiles = state.files.map((file) => {
                const hash = action.hashes.find((item) => {
                    return (item === file.hash && file.status !== publicationStatus.PUBLISHED);
                });
                if (hash) {
                    return ({
                        ...file,
                        status: publicationStatus.QUEUED
                    })
                } else {
                    return file;
                }
            })
            delete state.queuehash_bb;
            return {
                ...state,
                files: updatedFiles,
            }

        case "QUEUEHASHES_ERROR":
            console.log("error", action.e);
            delete state.queuehash_bb;
            return {
                ...state,
            }

        case "REDUX_WEBSOCKET::MESSAGE":
            const ms = JSON.parse(action.payload.message);
            ms.forEach((m) => {
                console.log(m.command);
                switch (m.command) {
                    case "totalhashes":
                    case "roothash":
                    case "txhash":
                    case "hashesqueuelength":
                    case "nextnotaryevent":
                        state[m.command] = m.data;
                        break;
                    case "indexupdated":
                        state.indexupdated = Date.now();
                        state.verifyfiles_bb = new PromiseBlackBox(res => ({ type: "VERIFYFILES" }))
                        break;
                    default:
                        console.log(`unknown command ${m.command}`);
                }
            });
            return {
                ...state,
            };

        case "SENDMESSAGE":
            if (!state.sendMessage) {
                return state;
            }
            return {
                ...state,
                sendmessage_bb: new PromiseBlackBox(
                    () => state.sendMessage(action.message)
                        .then(res => ({ type: "SENDMESSAGE_SUCCESS", res }))
                        .catch(e => ({ type: "SENDMESSAGE_ERROR", error: e }))
                )
            };

        default:
            return state;
    }
}

export default reducer;
