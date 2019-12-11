
import { PromiseBlackBox } from '@oqton/redux-black-box';
import { Wallet } from "ethers";

export const initialState = {
    pk: null,
    ownershipproofs: false
}

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
            return {
                ...state,
                ownershipproofs: action.value === true
            };
        default:
            return state;
    }
}

export default reducer;
