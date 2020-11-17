import React, { useEffect } from "react";
import "./sass/main.sass";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import pages from "./pages";
import CatchAll from "./pages/CatchAll";
import Navigation from "./components/Navigation";
import config from "./config";

import { connect as connect_ws } from '@giantmachines/redux-websocket';
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'


function getLibrary(provider) {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
  }

function App({ bootstrap }) {

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    return (
        <div className="App">

<Web3ReactProvider getLibrary={getLibrary}>

            <BrowserRouter>
                <Switch>
                    {Object.values(pages).map(({ RootComponent, parentPath, rootPath }) => (
                        <Route
                            key={rootPath}
                            path={rootPath}
                            exact={rootPath === "/"}
                            render={props => (
                                <section className="hero is-default is-bold">
                                    <div className="hero-head">
                                        <Navigation />
                                    </div>
                                    <div className="hero-body">
                                        <RootComponent parentpath={parentPath} rootpath={rootPath} {...props} />
                                    </div>
                                    <div className="hero-foot">                                       
                                    </div>
                                </section>
                            )}
                        />
                    ))}
                    <Route component={CatchAll} />
                </Switch>
            </BrowserRouter>
            </Web3ReactProvider>
        </div>
    );
}

const mapStateToProps = state => {
    return {
        ...state.wallets
    };
};


const mapDispachToProps = dispatch => {
    return {
        bootstrap: () => {
            dispatch({ type: "BOOTSTRAP" });
            dispatch(connect_ws(config.api.URL));
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispachToProps
)(App);
