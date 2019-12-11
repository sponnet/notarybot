import config from "../config";
import axios from "axios";

const publicationStatus =  {
    QUEUED: 1,
    // PUBLISHING: 2,
    PUBLISHED: 3
}

const postHash = (hashes) => {
    return new Promise((resolve, reject) => {
        axios
            .post(config.api.HTTPURL + "/hash", hashes)
            .then(res => {
                return resolve(res.data);
            })
            .catch(error => {
                if (error.response) {
                    return reject(new Error(`API returned error ${error.response.status}. Try again later.`));                
                } else {
                    return reject(new Error(`You seem to be offline. Try again later (${error.message})`));
                }
            });
    });
};

const verifyHashes = (hashes) => {
    return new Promise((resolve, reject) => {
        axios
            .post(config.api.HTTPURL + "/hash/verify", hashes)
            .then(res => {
                return resolve(res.data);
            })
            .catch(error => {
                if (error.response) {
                    return reject(new Error(`API returned error ${error.response.status}. Try again later.`));                
                } else {
                    return reject(new Error(`You seem to be offline. Try again later (${error.message})`));
                }
            });
    });
};


export {
    postHash,
    verifyHashes,
    publicationStatus
};
