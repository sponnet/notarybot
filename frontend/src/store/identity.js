
import { PromiseBlackBox } from '@oqton/redux-black-box';
import { Wallet, utils } from "ethers";

export const initialState = {
    pk: null,
    ownershipproofs: false,
    proofs: []
}

// debugger;
// let w = Wallet.createRandom();
// let signingAddress = utils.verifyMessage('QmfCYjgbA2aRbXzaD4M5j7K5JfzakGqRLdHqUki7KmVjwT', "0x48a7a408478e6740a25252384a6d708c2af3fac9521dd1582de38d0b7d15680004d54f306ccf5aa15d0393dbd3d7efc3e9ef5fd32c153b47e11899ffa37da0731c");


const reducer = (state = initialState, action) => {

    console.log(`identity reducer ${action.type}`);
    switch (action.type) {
        case "BOOTSTRAP":
            if (!state.pk) {
                console.log("Create new identity");
                state.pk = Wallet.createRandom().privateKey;
            }
            return {
                ...state,
                wallet: new Wallet(state.pk)
            };
        case "SETOWNERSHIPPROOFS":
            const ownershipproofs = action.value === true
            return {
                ...state,
                ownershipproofs: ownershipproofs,
                proofs: ownershipproofs ? state.proofs : initialState.proofs
            };
        case "SIGNHASHES":
            console.log("Sign hashes", action.hashes);
            if (!state.wallet || !state.ownershipproofs) {
                console.log("No wallet to sign hashes - or no proofs checked");
                return;
            }
            return {
                ...state,
                signhashes_bb: new PromiseBlackBox(
                    () => {

                        return Promise.all(action.hashes.map((hash) => {
                            return state.wallet.signMessage(hash).then((sig) => {
                                return ({ hash: hash, sig: sig });
                            });
                        }))

                            .then(res => ({ type: "SIGNHASHES_SUCCESS", res }))
                            .catch(e => ({ type: "SIGNHASHES_ERROR", error: e }))

                    })

                // ownershipproofs: action.value === true
            };
        case "SIGNHASHES_SUCCESS":
            console.log("A=", action.res)
            return {
                ...state,
                proofs: action.res
            };

        default:
            return state;
    }
}

export default reducer;
